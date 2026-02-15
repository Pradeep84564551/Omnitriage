import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader2, Sparkles, Mic, MicOff } from 'lucide-react';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'system', content: "Hello! I'm your AI Triage Assistant. How can I help you today? You can describe your symptoms in any language." }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const messagesEndRef = useRef(null);

    // Speech Recognition Setup
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = useRef(null);

    useEffect(() => {
        if (SpeechRecognition) {
            recognition.current = new SpeechRecognition();
            recognition.current.continuous = false;
            recognition.current.interimResults = false;
            recognition.current.lang = 'en-US'; // Default to English

            recognition.current.onstart = () => {
                setIsListening(true);
            };

            recognition.current.onend = () => {
                setIsListening(false);
            };

            recognition.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setInput(prev => prev + (prev ? " " : "") + transcript);
            };

            recognition.current.onerror = (event) => {
                console.error("Speech recognition error", event.error);
                setIsListening(false);
            };
        }
    }, [SpeechRecognition]);

    const toggleListening = () => {
        if (!recognition.current) {
            alert("Your browser does not support voice input.");
            return;
        }

        if (isListening) {
            recognition.current.stop();
        } else {
            recognition.current.start();
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSendMessage = async () => {
        if (!input.trim()) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            // Prepare history for context
            const history = messages.filter(m => m.role !== 'system').map(m => ({
                role: m.role,
                content: m.content
            }));

            const response = await fetch('http://localhost:8000/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: userMessage.content,
                    history: history
                }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            const botMessage = { role: 'assistant', content: data.response };
            setMessages(prev => [...prev, botMessage]);

        } catch (error) {
            console.error("Chat Error:", error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "I'm having trouble connecting to my brain right now. Please ensure Ollama is running (`ollama serve`)."
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">

            {/* Chat Window */}
            {isOpen && (
                <div className="w-[350px] h-[500px] bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden mb-4 transition-all animate-in slide-in-from-bottom-10 fade-in duration-300">

                    {/* Header */}
                    <div className="bg-gradient-to-r from-[#00b4db] to-[#00dfc4] p-4 flex justify-between items-center text-white">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-white/20 rounded-full backdrop-blur-sm">
                                <Bot className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">AI Triage Assistant</h3>
                                <p className="text-[10px] text-white/80 flex items-center gap-1">
                                    <Sparkles className="w-3 h-3" /> Powered by Gemma
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1 hover:bg-white/20 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 bg-slate-50 scrollbar-thin scrollbar-thumb-slate-200">
                        <div className="flex flex-col gap-3">
                            {messages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={`flex items-start gap-2 max-w-[85%] ${msg.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-[#00b4db]/10 text-[#00b4db]' : 'bg-white shadow-sm text-emerald-500'}`}>
                                        {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                    </div>

                                    <div className={`p-3 rounded-2xl text-[13px] leading-relaxed shadow-sm ${msg.role === 'user'
                                            ? 'bg-[#00b4db] text-white rounded-br-none'
                                            : 'bg-white text-slate-600 rounded-bl-none border border-slate-100'
                                        }`}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))}

                            {isLoading && (
                                <div className="flex items-start gap-2 max-w-[85%] self-start">
                                    <div className="w-8 h-8 rounded-full bg-white shadow-sm text-emerald-500 flex items-center justify-center flex-shrink-0">
                                        <Bot className="w-4 h-4" />
                                    </div>
                                    <div className="bg-white p-3 rounded-2xl rounded-bl-none border border-slate-100 shadow-sm flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin text-[#00b4db]" />
                                        <span className="text-xs text-slate-400">Thinking...</span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>

                    {/* Input Area */}
                    <div className="p-3 bg-white border-t border-slate-100">
                        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200 focus-within:border-[#00b4db] focus-within:ring-1 focus-within:ring-[#00b4db]/20 transition-all">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyPress}
                                placeholder={isListening ? "Listening..." : "Type symptoms or use voice..."}
                                className={`flex-1 bg-transparent border-none outline-none text-sm text-slate-700 placeholder:text-slate-400 ${isListening ? 'animate-pulse' : ''}`}
                                disabled={isLoading}
                            />

                            {/* Voice Button */}
                            <button
                                onClick={toggleListening}
                                disabled={isLoading}
                                className={`p-2 rounded-lg transition-all ${isListening
                                        ? 'bg-red-500 text-white animate-pulse shadow-red-500/20'
                                        : 'text-slate-400 hover:text-[#00b4db] hover:bg-slate-100'
                                    }`}
                                title="Voice Input"
                            >
                                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                            </button>

                            <button
                                onClick={handleSendMessage}
                                disabled={!input.trim() || isLoading}
                                className={`p-2 rounded-lg transition-all ${!input.trim() || isLoading
                                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                        : 'bg-[#00b4db] text-white hover:bg-[#00a3c7] shadow-md shadow-[#00b4db]/20'
                                    }`}
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="text-center mt-2 flex justify-center gap-4">
                            <span className="text-[10px] text-slate-400">AI can make mistakes. Check important info.</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Toggle Button (FAB) */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center outline-none ring-4 ring-white ${isOpen ? 'bg-slate-700 rotate-90' : 'bg-gradient-to-r from-[#00b4db] to-[#00dfc4] hover:shadow-[#00b4db]/40'}`}
            >
                {isOpen ? <X className="w-6 h-6 text-white" /> : <MessageSquare className="w-6 h-6 text-white" />}
            </button>
        </div>
    );
};

export default Chatbot;
