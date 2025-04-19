// Update this page (the content is just a fallback if you fail to update the page)

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to Your Blank App</h1>
        <p className="text-xl text-gray-600">Start building your amazing project here!</p>
      </div>
      <a
        href="/university-link-demo"
        className="m-2 p-4 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded shadow-lg transition-all duration-300 flex flex-col items-center justify-center"
      >
        <div className="text-2xl mb-2">📚</div>
        <div className="font-bold">University Link Demo</div>
        <div className="text-xs mt-1">Real-time notes sharing</div>
      </a>
    </div>
  );
};

export default Index;
