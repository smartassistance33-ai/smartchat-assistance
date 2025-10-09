import React, { useState } from 'react';

function App() {
  const [tool, setTool] = useState('view_leads');
  const [args, setArgs] = useState({});
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleToolChange = (e) => {
    setTool(e.target.value);
    setArgs({}); // Reset args when tool changes
  };

  const handleArgChange = (e) => {
    setArgs({ ...args, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch('/api/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool, args }),
      });
      const data = await res.json();
      setResponse(data);
    } catch (err) {
      setResponse({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const renderArgFields = () => {
    switch (tool) {
      case 'setup_auto_reply':
        return (
          <>
            <div className="mb-4">
              <label htmlFor="keyword" className="block text-sm font-medium text-gray-700">Keyword</label>
              <input type="text" name="keyword" id="keyword" onChange={handleArgChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div className="mb-4">
              <label htmlFor="reply" className="block text-sm font-medium text-gray-700">Reply</label>
              <input type="text" name="reply" id="reply" onChange={handleArgChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
          </>
        );
      case 'send_message':
        return (
          <>
            <div className="mb-4">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
              <input type="text" name="phone" id="phone" onChange={handleArgChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div className="mb-4">
              <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
              <textarea name="message" id="message" onChange={handleArgChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"></textarea>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-xl w-full bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">SmartChat Assistant</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="tool" className="block text-sm font-medium text-gray-700">Select a Tool</label>
            <select id="tool" name="tool" value={tool} onChange={handleToolChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
              <option value="view_leads">View Leads</option>
              <option value="setup_auto_reply">Setup Auto Reply</option>
              <option value="send_message">Send Message</option>
            </select>
          </div>
          {renderArgFields()}
          <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300">
            {loading ? 'Executing...' : 'Call Tool'}
          </button>
        </form>
        {response && (
          <div className="mt-6">
            <h2 className="text-lg font-medium text-gray-900">Response</h2>
            <pre className="mt-2 p-4 bg-gray-50 rounded-md overflow-x-auto text-sm">
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;