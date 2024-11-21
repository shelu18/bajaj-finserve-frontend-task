import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Send, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

interface ProcessedData {
  is_success: boolean;
  user_id: string;
  email: string;
  roll_number: string;
  numbers: string[];
  alphabets: string[];
  highest_lowercase_alphabet: string[];
  is_prime_found: boolean;
  file_valid?: boolean;
  file_mime_type?: string;
  file_size_kb?: string;
}

function Dashboard() {
  const [jsonInput, setJsonInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { logout, token } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result as string;
        const base64Content = base64String.split(',')[1];
        resolve(base64Content);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let parsedInput;
      try {
        parsedInput = JSON.parse(jsonInput);
      } catch {
        throw new Error('Invalid JSON format');
      }

      let base64String = '';
      if (selectedFile) {
        try {
          base64String = await convertFileToBase64(selectedFile);
        } catch {
          throw new Error('Failed to process file');
        }
      }

      const payload = {
        ...parsedInput,
        file_b64: base64String,
      };

      const response = await fetch('http://localhost:3000/bfhl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      
      const data = await response.json();
      if (response.ok) {
        setProcessedData(data);
        toast.success('Data processed successfully!');
      } else {
        toast.error(data.error || 'Processing failed');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const renderResponse = () => {
    if (!processedData) return null;

    return (
      <div className="mt-6 bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Response</h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded">
              <h4 className="text-sm font-medium text-gray-700 mb-2">User Info</h4>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">User ID: {processedData.user_id}</p>
                <p className="text-sm text-gray-600">Email: {processedData.email}</p>
                <p className="text-sm text-gray-600">Roll Number: {processedData.roll_number}</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Processing Results</h4>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Status: <span className={processedData.is_success ? 'text-green-600' : 'text-red-600'}>
                    {processedData.is_success ? 'Success' : 'Failed'}
                  </span>
                </p>
                <p className="text-sm text-gray-600">
                  Prime Found: <span className={processedData.is_prime_found ? 'text-green-600' : 'text-red-600'}>
                    {processedData.is_prime_found ? 'Yes' : 'No'}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Numbers</h4>
              <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                {JSON.stringify(processedData.numbers, null, 2)}
              </pre>
            </div>

            <div className="bg-gray-50 p-4 rounded">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Alphabets</h4>
              <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                {JSON.stringify(processedData.alphabets, null, 2)}
              </pre>
            </div>

            <div className="bg-gray-50 p-4 rounded">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Highest Lowercase</h4>
              <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                {JSON.stringify(processedData.highest_lowercase_alphabet, null, 2)}
              </pre>
            </div>
          </div>

          {(processedData.file_valid || processedData.file_mime_type) && (
            <div className="bg-gray-50 p-4 rounded">
              <h4 className="text-sm font-medium text-gray-700 mb-2">File Information</h4>
              <div className="space-y-2">
                {processedData.file_valid !== undefined && (
                  <p className="text-sm text-gray-600">
                    Valid: <span className={processedData.file_valid ? 'text-green-600' : 'text-red-600'}>
                      {processedData.file_valid ? 'Yes' : 'No'}
                    </span>
                  </p>
                )}
                {processedData.file_mime_type && (
                  <p className="text-sm text-gray-600">Type: {processedData.file_mime_type}</p>
                )}
                {processedData.file_size_kb && (
                  <p className="text-sm text-gray-600">Size: {processedData.file_size_kb} KB</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-indigo-600">Data Processor</h1>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow px-5 py-6 sm:px-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="json" className="block text-sm font-medium text-gray-700">
                  JSON Input
                </label>
                <div className="mt-1">
                  <textarea
                    id="json"
                    name="json"
                    rows={4}
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder='{"data": ["A","C","z"]}'
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload File
                </label>
                <div className="mt-1 flex items-center">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Choose File
                  </button>
                  {selectedFile && (
                    <span className="ml-3 text-sm text-gray-600">
                      {selectedFile.name}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isLoading ? 'Processing...' : 'Process Data'}
                </button>
              </div>
            </form>

            {renderResponse()}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;