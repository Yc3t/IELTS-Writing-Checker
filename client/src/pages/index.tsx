import Globe from "@/components/ui/Globe";
import router from "next/router";
function LandingPage() {

  const navigateToEditor = () => {
    router.push('/dashboard');
  };

  return (
    <>
   <div className="container mx-auto px-4">
 <h1 className="text-center text-5xl md:text-8xl md:mb-3 md:mt-20 bg-clip-text text-transparent bg-gradient-to-b from-white to-neutral-500 font-sans font-bold">
        ANALYZE
        <br/>
        YOUR
        <span className="bg-clip-text text-transparent bg-gradient-to-b from-blue-500 to-blue-950"> WRITING.</span>
      </h1>      {/* Pass the required props to the dynamically imported Globe component */}
      <div className="text-center">
        <button className="mt-8 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                onClick={navigateToEditor}>
          Start Writing Check
        </button>
      </div>
      <Globe/>
    
   </div> 
    </>
  );
}

export default LandingPage;
