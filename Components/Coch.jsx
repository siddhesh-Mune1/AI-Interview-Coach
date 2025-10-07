import React, { useState, useEffect } from 'react'
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { dracula } from "@uiw/codemirror-theme-dracula";
import { Code } from "lucide-react";

const Coch = () => {
    const [aiReady, setAiready] = useState(false);
    const [questionData, setquestiondata] = useState(null);
    const [answerData, setAnswerData] = useState(null);
    const [code, setCode] = useState(`function solution() { \n //Your Code Here \n}`);
    const [feedBack, setFeedback] = useState("");
    const [loading, setLoading] = useState(false);
    const [solved, setSolved] = useState(false);
    const [difficulty, setdifficulty] = useState("");
    const [language, setLanguage] = useState("");
    const [warning, setWarning] = useState("");

    useEffect(() => {
        const checkReady = setInterval(() => {
            if (window.puter?.ai?.chat) {
                setAiready(true);
                clearInterval(checkReady);
            }
        }, 300)
        return () => clearInterval(checkReady);
    }, [])

    const handleDifficultySelect = (level) => {
        setdifficulty(level);
        if (warning) setWarning("");
    }

    const handleProgramingLanguage = (languageType) => {
        setLanguage(languageType);
        if (warning) setWarning("");
    }



    const generateQuestion = async () => {
        const validLevels = ["easy", "medium", "hard"];
        const validLanguage = ["Javascript", "React.js", "express.js"];
        if (!validLevels.includes(difficulty)) {
            setWarning("Please select a valid difficulty level (easy, medium, hard).");
            return;
        }

        if (!validLanguage.includes(language)) {
            setWarning("Please select a valid Programing Language.");
            return;
        }

        setWarning("");
        setLoading(true);
        setSolved(false);
        setFeedback("");
        setAnswerData(null);
        setCode(`function solution() { \n //Your Code Here \n}`);
        setquestiondata(null);

        try {
            const res = await window.puter.ai.chat(
                `
                Generate a random ${difficulty} Level for ${language}  coding interview question like on leetcode. Return Only Valid JSON With This Structure:
                {
                    "problem": "string",
                    "language": ${language},
                    "example": "string",
                    "constraints": "string",
                    "note" : "string or empty if none"
                }
                `
            )
            const reply = typeof res === "string" ? res : res.message?.content || "";
            const parsedData = JSON.parse(reply);
            setquestiondata(parsedData);
        } catch (error) {
            setFeedback("Error :" + error.message || "An error occurred while generating the question.");
        }
        setLoading(false);
    }

    const checkSolution = async () => {
        if (!code.trim()) return;
        setLoading(true);

        try {
            const res = await window.puter.ai.chat(
                `
                You are a helpful interview Coach.
                The question is : "${questionData?.problem}".
                Here is the solution provided by the candidate : \n"${code}".

                1. If correct, say: "Correct Solution"
                2. If wrong, give hints but don't reveal the full answer.
                `
            )

            const reply = typeof res === "string" ? res : res.message?.content || "";
            setFeedback(reply);

            if (reply.includes("Correct Solution")) {
                setSolved(true);
            }
            setLoading(false);
        } catch (error) {
            setFeedback("Error :" + error.message || "An error occurred while generating the question.");
        }
    }

    const handleHomeClick = () => {
        setquestiondata(null);
        setCode(`function solution() { \n //Your Code Here \n}`);
        setFeedback("");
        setSolved(false);
        setdifficulty("");
        setWarning("");
        setLanguage("");
        setAnswerData(null);
    }


    const nextQuestion = () => {
        setquestiondata(null);
        setCode(`function solution() { \n //Your Code Here \n}`);
        setFeedback("");
        setSolved(false);
        setWarning("");
        alert(" Wait a moment, Generating New Question.");
        generateQuestion();
        setCode(`function solution() { \n //Your Code Here \n}`);
        setAnswerData(null);
    }

    const answerTheQuestion = async () => {

        setLoading(true);
        try {

            if (answerData) {
                setLoading(true);
                setFeedback("All Ready answerd.");
                setLoading(false);
                return;
            }
            const res = await window.puter.ai.chat(
                `
                You are a helpful interview Coach.
                The question is : "${questionData?.problem}".
                Provide the correct answer for this question.
                Return Only Valid JSON With This Structure:
                {
                    "problem": "string",
                    "language": "${language}",
                    "example": "string",
                    "answer": "string",
                    "constraints": "string",
                    "note" : "string or empty if none"
                }
                `
            )

            const reply = typeof res === "string" ? res : res.message?.content || "";
            let parsedData;
            try {
                parsedData = JSON.parse(reply.trim());
            } catch (e) {
                console.error("Invalid JSON:", reply);
                setFeedback("The AI did not return valid JSON. Try again.");
                return;
            }
            // const parsedData = JSON.parse(reply);
            setAnswerData(parsedData);
            setCode(parsedData.answer);
            setLoading(false);
            setFeedback("Answer Generated. Check The Editor.");
            setSolved(true);
        } catch (error) {
            setFeedback("Error :" + error.message || "An error occurred while generating the Answer.");
        }

    }
    return (
        <>
            <div className='min-h-screen bg-gradient-to-br from-sky-900 via-slate-950 to-emerald-900 flex flex-col items-center justify-center p-6 gap-10'>
                <h1 className="text-4xl sm:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-sky-300 to-blue-500 bg-[length:200%_200%] animate-gradient text-center">
                    AI Interview Coach
                </h1>

                <div className="w-full max-w-7xl flex flex-col items-center justify-center">
                    {!questionData ? (
                        // -------------------- BEFORE GENERATE QUESTION --------------------
                        <div className="w-full max-w-md p-10 bg-gray-900/80 backdrop-blur-md border border-gray-700 rounded-3xl shadow-lg shadow-sky-600 hover:shadow-2xl hover:shadow-sky-400 transition duration-300 text-center">
                            <Code className="mx-auto mb-6 text-cyan-400 w-24 h-24" />
                            <h2 className='text-3xl font-semibold text-white mb-4'>Ready To Practice?</h2>
                            <p className='text-slate-300 mb-8 text-lg leading-relaxed'>
                                Solve coding interview questions generated by AI, get hints, and improve your skills.
                            </p>

                            <div className="mb-8">
                                <p className='text-sky-400 mb-4 text-lg font-semibold text-left'>
                                    Select Programing Language :
                                </p>
                                <div className="flex justify-center gap-3 flex-wrap sm:flex-nowrap">
                                    {["Javascript", "React.js", "express.js"].map((languageType) => (
                                        <button
                                            key={languageType}
                                            onClick={() => handleProgramingLanguage(languageType)}
                                            className={` px-4 sm:px-4 md:px-4 lg:px-6 py-3 rounded-full font-semibold transition-colors duration-200 cursor-pointer ${language === languageType
                                                ? "bg-blue-500 text-white shadow-md"
                                                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                                }`}
                                        >
                                            {languageType}
                                        </button>
                                    ))}
                                </div>
                            </div>


                            <div className="mb-8">
                                <p className='text-sky-400 mb-4 text-lg font-semibold text-left'>
                                    Select Difficulty Level:
                                </p>
                                <div className="flex justify-center gap-3 flex-wrap sm:flex-nowrap">
                                    {["easy", "medium", "hard"].map((level) => (
                                        <button
                                            key={level}
                                            onClick={() => handleDifficultySelect(level)}
                                            className={`px-4 sm:px-4 md:px-4 lg:px-6 py-3 rounded-full font-semibold transition-colors duration-200 cursor-pointer ${difficulty === level
                                                ? "bg-blue-500 text-white shadow-md"
                                                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                                }`}
                                        >
                                            {level}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {warning && (
                                <p className='text-red-500 font-semibold mb-4 '>{warning}</p>
                            )}

                            <button
                                onClick={generateQuestion}
                                disabled={!aiReady || loading}
                                className='w-full px-10 py-4 bg-gradient-to-r from-sky-400 to-emerald-400 hover:from-sky-500 hover:to-emerald-500 text-white font-semibold text-lg rounded-3xl shadow-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed'
                            >
                                {loading ? "Generating Question..." : "Generate Question"}
                            </button>
                        </div>
                    ) : (
                        // -------------------- AFTER QUESTION GENERATED --------------------
                        <div className='space-y-6 w-full max-w-4xl '>
                            {/* Problem Section */}
                            <div className='bg-gradient-to-br from-blue-950/40 to-sky-950/50 backdrop-blur-sm border border-indigo-400/30 rounded-2xl shadow-2xl p-8 space-y-4'>
                                <div className='text-lg font-semibold text-emerald-200 mb-1'>
                                    <h3>Problem</h3>
                                    <p className='text-gray-200'>{questionData.problem}</p>
                                </div>
                                {/* Print Language Name */}
                                <div className='text-lg font-semibold text-emerald-200 mb-1'>
                                    <h3>Language</h3>
                                    <p className='text-gray-200'>{questionData.language}</p>
                                </div>

                                <div className='text-lg font-semibold text-emerald-200 mb-1'>
                                    <h3>Example</h3>
                                    <pre className='bg-black/30 p-3 rounded text-gray-200 whitespace-pre-wrap'>
                                        {questionData.example}
                                    </pre>
                                </div>
                            </div>

                            {/* Code Editor */}
                            <div className='bg-gray-900/80 p-6 rounded-2xl shadow-lg'>
                                <h3 className='text-sky-300 font-semibold mb-3'>Your Solution</h3>
                                <CodeMirror
                                    value={answerData ? answerData.answer : code}
                                    height="200px"
                                    theme={dracula}
                                    extensions={[javascript()]}
                                    onChange={(value) => setCode(value)}
                                    className="rounded-lg overflow-hidden"
                                />
                            </div>

                            {/* Check Solution Button */}

                            {/* Check Solution Button */}
                            <div className='flex justify-center gap-6 flex-wrap sm:flex-nowrap'>
                                <button
                                    onClick={checkSolution}
                                    disabled={loading}
                                    className='px-4 py-2 text-sm            /* base → small screens (<640px) */
                                                sm:px-6 sm:py-3 sm:text-base /* ≥640px */
                                                md:px-8 md:py-3 md:text-lg   /* ≥768px */
                                                lg:px-10 lg:py-4 lg:text-xl  /* ≥1024px */
                                                bg-gradient-to-r from-green-400 to-emerald-600
                                                hover:from-green-500 hover:to-emerald-700
                                                text-white font-semibold
                                                rounded-3xl shadow-lg
                                                transition duration-300
                                                disabled:opacity-50 disabled:cursor-not-allowed'
                                >
                                    {loading ? "Checking..." : "Check Solution"}
                                </button>

                                {/* Home Button - Resets the State */}
                                <button
                                    onClick={handleHomeClick}
                                    disabled={loading}
                                    className='px-4 py-2 text-sm            
                                                sm:px-6 sm:py-3 sm:text-base 
                                                md:px-8 md:py-3 md:text-lg   
                                                lg:px-10 lg:py-4 lg:text-xl  
                                                bg-gradient-to-r from-green-400 to-emerald-600
                                                hover:from-green-500 hover:to-emerald-700
                                                text-white font-semibold
                                                rounded-3xl shadow-lg
                                                transition duration-300
                                                disabled:opacity-50 disabled:cursor-not-allowed'
                                >
                                    {loading ? "Opening Home..." : "Home"}
                                </button>

                                {/* Next Question Button */}
                                <button
                                    onClick={nextQuestion}
                                    disabled={loading}
                                    className='px-4 py-2 text-sm            
                                                sm:px-6 sm:py-3 sm:text-base 
                                                md:px-8 md:py-3 md:text-lg   
                                                lg:px-10 lg:py-4 lg:text-xl  
                                                bg-gradient-to-r from-green-400 to-emerald-600
                                                hover:from-green-500 hover:to-emerald-700
                                                text-white font-semibold
                                                rounded-3xl shadow-lg
                                                transition duration-300
                                                disabled:opacity-50 disabled:cursor-not-allowed'
                                >
                                    {loading ? "Next Question..." : "Next Question"}
                                </button>

                                {/* Answer The Question Button */}
                                <button
                                    onClick={answerTheQuestion}
                                    disabled={loading}
                                    className='px-4 py-2 text-sm            
                                                sm:px-6 sm:py-3 sm:text-base 
                                                md:px-8 md:py-3 md:text-lg   
                                                lg:px-10 lg:py-4 lg:text-xl  
                                                bg-gradient-to-r from-green-400 to-emerald-600
                                                hover:from-green-500 hover:to-emerald-700
                                                text-white font-semibold
                                                rounded-3xl shadow-lg
                                                transition duration-300
                                                disabled:opacity-50 disabled:cursor-not-allowed'
                                >
                                    {loading ? "Genrating Answer" : "Get Answer"}
                                </button>

                            </div>

                            {/* Feedback */}
                            {feedBack && (
                                <div className={`p-4 rounded-xl text-lg font-medium ${solved ? "bg-green-900 text-green-200 border border-green-500" : "bg-red-900 text-red-200 border border-red-500"
                                    }`}>
                                    {feedBack}
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>

            <script src="https://js.puter.com/v2/"></script>
        </>
    )
}

export default Coch;


//Siddhesh