import { Button } from "@/components/ui/button"
import { TooltipTrigger, TooltipContent, Tooltip, TooltipProvider } from "@/components/ui/tooltip"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { AccordionTrigger, AccordionContent, AccordionItem, Accordion } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { ChangeEvent, FormEvent,useEffect,useState } from 'react';
import React from "react"

interface EvaluationResult {
  score: string;
  feedback: string;
}

interface EvaluationResults {
  coherenceAndCohesion?: EvaluationResult;
  grammaticalRangeAndAccuracy?: EvaluationResult;
  lexicalResource?: EvaluationResult;
  taskResponse?: EvaluationResult;
}


export default function Dashboard() {
  const [inputText, setInputText] = useState<string>('');
  const [topicText, setTopicText] = useState<string>('');
  const [evaluationResults, setEvaluationResults] = useState<EvaluationResults>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(event.target.value);
  };

  const handleTopicChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setTopicText(event.target.value);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');
  
    try {
      const response = await fetch('http://localhost:8080/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ essay: inputText, topic: topicText })
      });
      const responseText = await response.text();
      if (response.ok) {
        console.log(responseText)
        parseEvaluationResults(responseText);
      } else {
        throw new Error('Failed to fetch scores');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (Object.keys(evaluationResults).length > 0) {
      console.log(evaluationResults); // Log results to console when they change
    }
  }, [evaluationResults]); // Dependency array to ensure logging happens only when evaluationResults changes

  const parseEvaluationResults = (responseText: string) => {
    let results: EvaluationResults = {}; // Initialize with the correct type
    const responseSections = responseText.split(/<final>\d+\.\d+<final>/);
  
    responseSections.forEach(section => {
      if (section.includes('Coherence and Cohesion')) {
        results.coherenceAndCohesion = extractScoreAndFeedback(section);
      } else if (section.includes('Grammatical Range and Accuracy')) {
        results.grammaticalRangeAndAccuracy = extractScoreAndFeedback(section);
      } else if (section.includes('Lexical Resource')) {
        results.lexicalResource = extractScoreAndFeedback(section);
      } else if (section.includes('Task Response')) {
        results.taskResponse = extractScoreAndFeedback(section);
      }
    });
  
    setEvaluationResults(results);
  };
  
  const extractScoreAndFeedback = (text: string) => {
    // Debug: Log the text to be processed.
    console.log("Text for Regex:", text);
  
    // Updated regex to match a number with optional decimal places.
    const scoreRegex = /(\d+(?:\.\d+)?)/;
    const scoreMatch = text.match(scoreRegex);
    console.log("Score Match:", scoreMatch);  // Debug: Log the regex match.
  
    // Extract score if a match is found; otherwise, return 'N/A'.
    const score = scoreMatch ? scoreMatch[1] : 'N/A';
  
    // Remove score from text to clean up feedback.
    const cleanFeedback = text.replace(scoreRegex, '').trim();
    console.log("Extracted Score:", score);  // Debug: Log the extracted score.
  
    return {
      score: score,
      feedback: cleanFeedback
    };
  };

  
  const formatFeedback = (feedback: string) => {
    // Remove newline characters, parentheses, double quotes, backslash, and curly braces
    const cleanedFeedback = feedback.replace(/\\n|[()""{}\\]/g, '');
  
    // Split the cleaned feedback into an array of lines
    const lines = cleanedFeedback.split('\n');
  
    // Map over each line to create a React.Fragment with the line text and a line break
    return lines.map((line, index, array) => (
      <React.Fragment key={index}>
        {line.trim()}
        {index !== array.length - 1 && <br />}
      </React.Fragment>
    ));
  };
  const convertScoreToGrade = (score: string) => {
    const num = parseFloat(score);
    if (num >= 9) return 'A+';
    if (num >= 8) return 'A';
    if (num >= 7) return 'B';
    if (num >= 6) return 'C';
    if (num >= 5) return 'D';
    return 'F';
};

// Then use this in your component
<div className="grade-badge">
    <Badge variant="outline">
        {evaluationResults.coherenceAndCohesion ? convertScoreToGrade(evaluationResults.coherenceAndCohesion.score) : 'N/A'}
    </Badge>
</div>

  
  
  

  return (
    <div key="1" className="grid h-screen w-full pl-[56px] ">
      <aside className="inset-y fixed  left-0 z-20 flex h-full flex-col border-r custom-border">
        <div className="border-b p-2 custom-border">
          <Button aria-label="Home" size="icon">
            <TriangleIcon className="size-5 fill-foreground " />
          </Button>
        </div>
        <nav className="grid gap-1 p-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button aria-label="Playground" className="rounded-lg bg-muted" size="icon" variant="ghost">
                  <SquareTerminalIcon className="size-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={5}>
                Playground
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button aria-label="Models" className="rounded-lg" size="icon" variant="ghost">
                  <BotIcon className="size-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={5}>
                Models
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button aria-label="API" className="rounded-lg" size="icon" variant="ghost">
                  <FileCode2Icon className="size-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={5}>
                API
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button aria-label="Documentation" className="rounded-lg" size="icon" variant="ghost">
                  <BookIcon className="size-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={5}>
                Documentation
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button aria-label="Settings" className="rounded-lg" size="icon" variant="ghost">
                  <Settings2Icon className="size-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={5}>
                Settings
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </nav>
        <nav className="mt-auto grid gap-1 p-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button aria-label="Help" className="mt-auto rounded-lg" size="icon" variant="ghost">
                  <LifeBuoyIcon className="size-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={5}>
                Help
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button aria-label="Account" className="mt-auto rounded-lg" size="icon" variant="ghost">
                  <SquareUserIcon className="size-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={5}>
                Account
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </nav>
      </aside>
      <div className="flex flex-col">
        <header className="sticky top-0 z-10 flex h-[57px] items-center gap-1 border-b bg-background px-4 custom-border ">
          <h1 className="text-xl font-semibold">Writing Checker</h1>
          
          <Button 
          className="ml-auto gap-1.5 text-sm" size="sm" variant="outline"
          
          >
            <ShareIcon className="size-3.5" />
            Share
          </Button>
        </header>
        

        <main className="flex-1 overflow-auto p-4 grid lg:grid-cols-4 gap-4">
              {/* Topic Section as Text Area */}
              <div className="lg:col-span-2 flex flex-col space-y-4">
              <div className="relative flex min-h-[20vh] h-auto flex-col rounded-xl bg-cust-black p-4 pt-5">
                <Badge className="absolute right-3 top-3" variant="outline">
                  Topic
                </Badge>
                <Textarea
                  className="flex-1 resize-none border-0 p-3 shadow-none focus-visible:ring-0 custom-border text-white bg-transparent"
                  placeholder="Enter topic here..."
                  value={topicText}
                  onChange={handleTopicChange}
                />
              </div>
            {/* Writing Section */}
           
            <div className="relative flex h-full min-h-[50vh] flex-col rounded-xl bg-cust-black p-4 pt-5 ">
              <form onSubmit={handleSubmit} className="flex flex-col flex-1">
                <Textarea
                  className="flex-1 resize-none border-0 p-3 shadow-none focus-visible:ring-0 custom-border text-white bg-transparent"
                  placeholder="Insert your writing here..."
                  value={inputText}
                  onChange={handleInputChange}
                />
                <div className="flex justify-end pt-2">
                  <Button className="gap-1.5 text-sm border-r-2" size="sm" type="submit">
                    Send
                    <CornerDownLeftIcon className="size-3.5" />
                  </Button>
                </div>
              </form>
            </div>
          </div>
        { /**================================================================================================
           *                                      Analysis Section
  *================================================================================================**/ }
          <div className="lg:col-span-2 relative flex-col items-start gap-8 flex">
            <form className="grid w-full items-start gap-6 ">
              <fieldset className="grid gap-6 rounded-lg border p-4 custom-border">
                <legend className="-ml-1 px-1 text-sm font-medium">Analyze</legend>
                <div className="grid gap-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-3xl" htmlFor="overall-score">Overall Band Score</Label>
                    <div className="relative h-20 w-20">
                {/* Circular progress bar to display the band score */}
                <CircularProgressbar 
                value={evaluationResults.coherenceAndCohesion ? parseFloat(evaluationResults.coherenceAndCohesion.score) : 0}
                maxValue={10}
                text={evaluationResults.coherenceAndCohesion ? evaluationResults.coherenceAndCohesion.score : 'N/A'}
                styles={buildStyles({
                  textColor: "white",
                  pathColor: "#23fd11",
                  trailColor: "gray",
                  textSize: '30px',
                })}
              />

                    </div>
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="grammar">Grammar Mistakes</Label>
                    <Input id="grammar" placeholder="0" type="number" />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="repeated-words">Words Repeated</Label>
                    <Input id="repeated-words" placeholder="0" type="number" />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="vocabulary">Vocabulary Complexity</Label>
                    <Input id="vocabulary" placeholder="0" type="number" />
                  </div>
                </div>
              </fieldset>
              
              <Accordion className="grid gap-6 rounded-lg border p-4 custom-border" collapsible type="single">

              <AccordionItem value="coherence-and-cohesion">
              <AccordionTrigger className="flex justify-between items-center w-full">
                  <div className="category-title">Coherence and Cohesion</div>
              <div className="grade-badge">
                  <Badge variant="outline">
                      {evaluationResults.coherenceAndCohesion ? convertScoreToGrade(evaluationResults.coherenceAndCohesion.score) : 'N/A'}
                  </Badge>
              </div>
                  <div className="grade-text">
                      <span className="text-sm text-muted-foreground">
                          Grade: {evaluationResults.coherenceAndCohesion ? evaluationResults.coherenceAndCohesion.score : 'N/A'}
                      </span>
                  </div>
              </AccordionTrigger>
              <AccordionContent>
              {evaluationResults.coherenceAndCohesion ? (
                <div className="feedback-text">
                  {formatFeedback(evaluationResults.coherenceAndCohesion.feedback)}
                </div>
              ) : (
                'No feedback available'
              )}
            </AccordionContent>
          </AccordionItem>


            <AccordionItem value="grammatical-range">
              <AccordionTrigger className="flex justify-between items-center w-full">
                  <div className="category-title">Gramatical Range and Accuracy</div>
              <div className="grade-badge">
                  <Badge variant="outline">
                      {evaluationResults.grammaticalRangeAndAccuracy ? convertScoreToGrade(evaluationResults.grammaticalRangeAndAccuracy.score) : 'N/A'}
                  </Badge>
              </div>
                  <div className="grade-text">
                      <span className="text-sm text-muted-foreground">
                          Grade: {evaluationResults.grammaticalRangeAndAccuracy ? evaluationResults.grammaticalRangeAndAccuracy.score : 'N/A'}
                      </span>
                  </div>
              </AccordionTrigger>
              <AccordionContent>
              {evaluationResults.grammaticalRangeAndAccuracy ? (
                <div className="feedback-text">
                  {formatFeedback(evaluationResults.grammaticalRangeAndAccuracy.feedback)}
                </div>
              ) : (
                'No feedback available'
              )}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="lexical-resource">
              <AccordionTrigger className="flex justify-between items-center w-full">
                  <div className="category-title">Lexical Resource</div>
              <div className="grade-badge">
                  <Badge variant="outline">
                      {evaluationResults.lexicalResource ? convertScoreToGrade(evaluationResults.lexicalResource.score) : 'N/A'}
                  </Badge>
              </div>
                  <div className="grade-text">
                      <span className="text-sm text-muted-foreground">
                          Grade: {evaluationResults.lexicalResource ? evaluationResults.lexicalResource.score : 'N/A'}
                      </span>
                  </div>
              </AccordionTrigger>
              <AccordionContent>
              {evaluationResults.lexicalResource ? (
                <div className="feedback-text">
                  {formatFeedback(evaluationResults.lexicalResource.feedback)}
                </div>
              ) : (
                'No feedback available'
              )}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="task-response">
              <AccordionTrigger className="flex justify-between items-center w-full">
                  <div className="category-title">Task Response</div>
              <div className="grade-badge">
                  <Badge variant="outline">
                      {evaluationResults.taskResponse ? convertScoreToGrade(evaluationResults.taskResponse.score) : 'N/A'}
                  </Badge>
              </div>
                  <div className="grade-text">
                      <span className="text-sm text-muted-foreground">
                          Grade: {evaluationResults.taskResponse ? evaluationResults.taskResponse.score : 'N/A'}
                      </span>
                  </div>
              </AccordionTrigger>
              <AccordionContent>
              {evaluationResults.taskResponse ? (
                <div className="feedback-text">
                  {formatFeedback(evaluationResults.taskResponse.feedback)}
                </div>
              ) : (
                'No feedback available'
              )}
            </AccordionContent>
          </AccordionItem>

              </Accordion>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}

function BirdIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 7h.01" />
      <path d="M3.4 18H12a8 8 0 0 0 8-8V7a4 4 0 0 0-7.28-2.3L2 20" />
      <path d="m20 7 2 .5-2 .5" />
      <path d="M10 18v3" />
      <path d="M14 17.75V21" />
      <path d="M7 18a6 6 0 0 0 3.84-10.61" />
    </svg>
  )
}


function BookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </svg>
  )
}


function BotIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 8V4H8" />
      <rect width="16" height="12" x="4" y="8" rx="2" />
      <path d="M2 14h2" />
      <path d="M20 14h2" />
      <path d="M15 13v2" />
      <path d="M9 13v2" />
    </svg>
  )
}


function ChevronDownIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}


function CornerDownLeftIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="9 10 4 15 9 20" />
      <path d="M20 4v7a4 4 0 0 1-4 4H4" />
    </svg>
  )
}


function FileCode2Icon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="m5 12-3 3 3 3" />
      <path d="m9 18 3-3-3-3" />
    </svg>
  )
}


function LifeBuoyIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m4.93 4.93 4.24 4.24" />
      <path d="m14.83 9.17 4.24-4.24" />
      <path d="m14.83 14.83 4.24 4.24" />
      <path d="m9.17 14.83-4.24 4.24" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  )
}


function MicIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" x2="12" y1="19" y2="22" />
    </svg>
  )
}


function PaperclipIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </svg>
  )
}


function RabbitIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M13 16a3 3 0 0 1 2.24 5" />
      <path d="M18 12h.01" />
      <path d="M18 21h-8a4 4 0 0 1-4-4 7 7 0 0 1 7-7h.2L9.6 6.4a1 1 0 1 1 2.8-2.8L15.8 7h.2c3.3 0 6 2.7 6 6v1a2 2 0 0 1-2 2h-1a3 3 0 0 0-3 3" />
      <path d="M20 8.54V4a2 2 0 1 0-4 0v3" />
      <path d="M7.612 12.524a3 3 0 1 0-1.6 4.3" />
    </svg>
  )
}


function Settings2Icon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 7h-9" />
      <path d="M14 17H5" />
      <circle cx="17" cy="17" r="3" />
      <circle cx="7" cy="7" r="3" />
    </svg>
  )
}


function SettingsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}


function ShareIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" x2="12" y1="2" y2="15" />
    </svg>
  )
}


function SquareTerminalIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m7 11 2-2-2-2" />
      <path d="M11 13h4" />
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
    </svg>
  )
}


function SquareUserIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <circle cx="12" cy="10" r="3" />
      <path d="M7 21v-2a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" />
    </svg>
  )
}


function TriangleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M13.73 4a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    </svg>
  )
}


function TurtleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 10 2 4v3a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-3a8 8 0 1 0-16 0v3a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-3l2-4h4Z" />
      <path d="M4.82 7.9 8 10" />
      <path d="M15.18 7.9 12 10" />
      <path d="M16.93 10H20a2 2 0 0 1 0 4H2" />
    </svg>
  )
}