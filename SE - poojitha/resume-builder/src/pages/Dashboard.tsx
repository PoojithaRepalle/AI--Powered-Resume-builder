import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const templates = [
  {
    id: 1,
    slug: 'professional',
    name: 'Professional',
    image:
      'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&q=80&w=300&h=400',
  },
  {
    id: 2,
    slug: 'creative',
    name: 'Creative',
    image:
      'https://images.unsplash.com/photo-1586281380117-5a60ae2050cc?auto=format&fit=crop&q=80&w=300&h=400',
  },
  {
    id: 3,
    slug: 'modern',
    name: 'Modern',
    image:
      'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&q=80&w=300&h=400',
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleTemplateSelect = (slug: string) => {
    navigate(`/builder/${slug}`); // updated to use slug in URL
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">AI Resume Builder</span>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <LogOut className="h-5 w-5 mr-2" />
              Sign out
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-2xl font-semibold text-gray-900">Choose a Template</h1>
          <p className="mt-1 text-sm text-gray-600">
            Select a template to start building your professional resume
          </p>

          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <div
                key={template.id}
                className="relative bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                onClick={() => handleTemplateSelect(template.slug)}
              >
                <div className="h-48 w-full overflow-hidden rounded-t-lg">
                  <img
                    src={template.image}
                    alt={template.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-medium text-gray-900">{template.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Perfect for {template.name.toLowerCase()} roles
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
