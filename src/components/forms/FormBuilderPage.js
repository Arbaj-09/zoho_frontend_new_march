'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formApi } from '@/services/formApi';
import { clientApi } from '@/services/clientApi';
import { ArrowLeft, Save, Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function FormBuilderPage({ params }) {
  const router = useRouter();
  const isEdit = !!params?.id;
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    clientId: '',
    schema: {
      title: '',
      description: '',
      settings: {},
      sections: [
        {
          sequence: 1,
          title: '',
          description: '',
          questions: []
        }
      ]
    }
  });
  
  const [clients, setClients] = useState([]);
  const [activeTab, setActiveTab] = useState('questions');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEdit && params?.id) {
      loadForm();
    }
  }, [isEdit, params?.id]);

  // Load clients for dropdown
  useEffect(() => {
    (async () => {
      try {
        const clientList = await clientApi.list();
        console.log("Loaded Clients:", clientList);
        setClients(Array.isArray(clientList) ? clientList : []);
      } catch (e) {
        console.error("Failed to load clients:", e);
        setClients([]);
      }
    })();
  }, []);

  const loadForm = async () => {
    try {
      setLoading(true);
      const form = await formApi.getById(params?.id);
      
      let parsedSchema;
      try {
        parsedSchema = form.schema ? JSON.parse(form.schema) : null;
      } catch (e) {
        console.error('Failed to parse schema:', e);
        parsedSchema = null;
      }
      
      setFormData({
        name: form.name || '',
        description: form.description || '',
        clientId: form.clientId?.toString() || '',
        schema: parsedSchema || {
          title: '',
          description: '',
          settings: {},
          sections: [
            {
              sequence: 1,
              title: '',
              description: '',
              questions: []
            }
          ]
        }
      });
    } catch (error) {
      console.error('Failed to load form:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Get current employee ID from localStorage
      let employeeId = null;
      if (typeof window !== "undefined") {
        try {
          const emp = JSON.parse(localStorage.getItem("user_data") || "{}");
          employeeId = emp?.id;
          console.log("DEBUG: Sending form with createdBy:", employeeId);
          console.log("DEBUG: Employee data:", emp);
        } catch (e) {
          console.error("Failed to get employee ID:", e);
        }
      }
      
      const payload = {
        name: formData.name,
        description: formData.description,
        schema: JSON.stringify(formData.schema),
        clientId: formData.clientId ? Number(formData.clientId) : null,
        createdBy: employeeId, // Send the actual employee ID
        updatedBy: employeeId,
      };

      if (isEdit) {
        await formApi.update(params?.id, payload);
      } else {
        await formApi.create(payload);
      }
      
      // Navigate back and refresh
      router.push('/form');
      router.refresh();
    } catch (error) {
      console.error('Failed to save form:', error);
      alert('Failed to save form');
    } finally {
      setSaving(false);
    }
  };

  const updateSchema = (path, value) => {
    setFormData(prev => {
      const newSchema = { ...prev.schema };
      const keys = path.split('.');
      let current = newSchema;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return { ...prev, schema: newSchema };
    });
  };

  const addQuestion = (sectionIndex) => {
    const newQuestion = {
      id: Date.now(),
      type: 'text',
      label: '',
      required: false,
      options: []
    };
    
    updateSchema(`sections.${sectionIndex}.questions`, [
      ...sections[sectionIndex].questions,
      newQuestion
    ]);
  };

  const updateQuestion = (sectionIndex, questionIndex, field, value) => {
    updateSchema(
      `sections.${sectionIndex}.questions.${questionIndex}.${field}`,
      value
    );
  };

  const removeQuestion = (sectionIndex, questionIndex) => {
    const questions = [...sections[sectionIndex].questions];
    questions.splice(questionIndex, 1);
    updateSchema(`sections.${sectionIndex}.questions`, questions);
  };

  const moveQuestion = (sectionIndex, questionIndex, direction) => {
    const questions = [...sections[sectionIndex].questions];
    const newIndex = questionIndex + direction;
    
    if (newIndex >= 0 && newIndex < questions.length) {
      [questions[questionIndex], questions[newIndex]] = [questions[newIndex], questions[questionIndex]];
      updateSchema(`sections.${sectionIndex}.questions`, questions);
    }
  };

  const addSection = () => {
    const newSection = {
      sequence: sections.length + 1,
      title: '',
      description: '',
      questions: []
    };
    
    setFormData(prev => ({
      ...prev,
      schema: {
        ...prev.schema,
        sections: [...prev.schema.sections, newSection]
      }
    }));
  };

  const removeSection = (sectionIndex) => {
    const currentSections = [...sections];
    currentSections.splice(sectionIndex, 1);
    
    // Reorder sequences
    currentSections.forEach((section, index) => {
      section.sequence = index + 1;
    });
    
    setFormData(prev => ({
      ...prev,
      schema: {
        ...prev.schema,
        sections: currentSections
      }
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-blue-600 mx-auto"></div>
          <p className="mt-2 text-slate-600">Loading form...</p>
        </div>
      </div>
    );
  }

  // Ensure sections is always an array
  const sections = Array.isArray(formData.schema?.sections) ? formData.schema.sections : [];

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/form')}
              className="p-2 hover:bg-slate-100 rounded-lg"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-xl font-semibold text-slate-900">
              {isEdit ? 'Edit Form' : 'Create Form'}
            </h1>
          </div>
          
          <button
            onClick={handleSave}
            disabled={saving || !formData.name.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab('questions')}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'questions'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Questions
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'settings'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Settings
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'questions' ? (
          <div className="space-y-6">
            {/* Form Title and Description */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Form Details</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Form Title <span className="text-red-500">*</span>
                    <span className="text-slate-400 text-xs ml-2">
                      ({formData.name.length}/200)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value.slice(0, 200) }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter form title"
                    maxLength={200}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Form Description
                    <span className="text-slate-400 text-xs ml-2">
                      ({formData.description.length}/200)
                    </span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value.slice(0, 200) }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter form description"
                    maxLength={200}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Client
                  </label>
                  <select
                    value={formData.clientId}
                    onChange={(e) => setFormData(prev => ({ ...prev, clientId: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Client</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Sections */}
            {sections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Section {section.sequence + 1} of {sections.length}
                  </h3>
                  {sections.length > 1 && (
                    <button
                      onClick={() => removeSection(sectionIndex)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Section Title
                      <span className="text-slate-400 text-xs ml-2">
                        ({section.title.length}/200)
                      </span>
                    </label>
                    <input
                      type="text"
                      value={section.title}
                      onChange={(e) => updateSchema(`sections.${sectionIndex}.title`, e.target.value.slice(0, 200))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter section title"
                      maxLength={200}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Section Description
                      <span className="text-slate-400 text-xs ml-2">
                        ({section.description.length}/200)
                      </span>
                    </label>
                    <textarea
                      value={section.description}
                      onChange={(e) => updateSchema(`sections.${sectionIndex}.description`, e.target.value.slice(0, 200))}
                      rows={2}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter section description"
                      maxLength={200}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Section Sequence: {section.sequence}
                    </label>
                  </div>

                  {/* Questions */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-md font-medium text-slate-800">Questions</h4>
                      <button
                        onClick={() => addQuestion(sectionIndex)}
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
                      >
                        <Plus className="h-4 w-4" />
                        Add Question
                      </button>
                    </div>
                    
                    {section.questions.map((question, questionIndex) => (
                      <div key={question.id} className="border border-slate-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-slate-700">Question {questionIndex + 1}</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => moveQuestion(sectionIndex, questionIndex, -1)}
                              disabled={questionIndex === 0}
                              className="p-1 hover:bg-slate-100 rounded disabled:opacity-50"
                            >
                              <ChevronUp className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => moveQuestion(sectionIndex, questionIndex, 1)}
                              disabled={questionIndex === section.questions.length - 1}
                              className="p-1 hover:bg-slate-100 rounded disabled:opacity-50"
                            >
                              <ChevronDown className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => removeQuestion(sectionIndex, questionIndex)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Question Label</label>
                            <input
                              type="text"
                              value={question.label}
                              onChange={(e) => updateQuestion(sectionIndex, questionIndex, 'label', e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500"
                              placeholder="Enter question"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Type</label>
                            <select
                              value={question.type}
                              onChange={(e) => updateQuestion(sectionIndex, questionIndex, 'type', e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="text">Text</option>
                              <option value="number">Number</option>
                              <option value="email">Email</option>
                              <option value="textarea">Textarea</option>
                              <option value="select">Select</option>
                              <option value="radio">Radio</option>
                              <option value="checkbox">Checkbox</option>
                            </select>
                          </div>
                          
                          <div className="md:col-span-2">
                            <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
                              <input
                                type="checkbox"
                                checked={question.required}
                                onChange={(e) => updateQuestion(sectionIndex, questionIndex, 'required', e.target.checked)}
                              />
                              Required
                            </label>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {section.questions.length === 0 && (
                      <div className="text-center py-8 text-slate-500 text-sm">
                        No questions added yet. Click "Add Question" to get started.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Add Section Button */}
            <button
              onClick={addSection}
              className="w-full py-3 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-slate-400 hover:text-slate-700 flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Section
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Form Settings</h2>
            <p className="text-slate-600">Settings panel coming soon...</p>
          </div>
        )}
      </div>
    </div>
    </DashboardLayout>
  );
}
