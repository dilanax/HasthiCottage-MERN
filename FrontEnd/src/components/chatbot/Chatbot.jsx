import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, MapPin, Clock, Star, Phone, Globe, Sparkles, ChevronRight, Navigation, Award, Camera, Heart } from 'lucide-react';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const nearbyPlaces = [
    {
      id: 1,
      name: "Udawalawe National Park",
      type: "Wildlife Safari",
      distance: "5 km",
      duration: "3-4 hours",
      rating: 4.8,
      description: "Famous for large elephant herds, leopards, and diverse bird species. Perfect for wildlife photography.",
      activities: ["Elephant Safari", "Bird Watching", "Photography"],
      bestTime: "6:00 AM - 6:00 PM",
      contact: "+94 47 492 0001",
      website: "www.udawalawe.com"
    },
    {
      id: 2,
      name: "Udawalawe Elephant Transit Home",
      type: "Conservation Center",
      distance: "3 km",
      duration: "1-2 hours",
      rating: 4.6,
      description: "Rehabilitation center for orphaned elephant calves. Watch feeding sessions and learn about conservation.",
      activities: ["Elephant Feeding", "Educational Tours", "Conservation Learning"],
      bestTime: "10:00 AM - 4:00 PM",
      contact: "+94 47 492 0002",
      website: "www.elephanttransithome.lk"
    },
    {
      id: 3,
      name: "Udawalawe Reservoir",
      type: "Scenic Viewpoint",
      distance: "8 km",
      duration: "2-3 hours",
      rating: 4.4,
      description: "Beautiful man-made lake perfect for relaxation and picnics with stunning sunset views.",
      activities: ["Picnic", "Boating", "Photography", "Relaxation"],
      bestTime: "5:00 AM - 7:00 PM",
      contact: "+94 47 492 0003",
      website: "www.udawalawe.gov.lk"
    },
    {
      id: 4,
      name: "Bundala National Park",
      type: "Bird Sanctuary",
      distance: "45 km",
      duration: "4-5 hours",
      rating: 4.7,
      description: "UNESCO World Heritage site known for migratory birds and saltwater crocodiles.",
      activities: ["Bird Watching", "Crocodile Spotting", "Nature Walks"],
      bestTime: "6:00 AM - 6:00 PM",
      contact: "+94 47 492 0004",
      website: "www.bundala.com"
    },
    {
      id: 5,
      name: "Kataragama Temple",
      type: "Religious Site",
      distance: "35 km",
      duration: "3-4 hours",
      rating: 4.5,
      description: "Sacred Hindu and Buddhist pilgrimage site with rich cultural heritage.",
      activities: ["Temple Visit", "Cultural Experience", "Religious Ceremonies"],
      bestTime: "5:00 AM - 8:00 PM",
      contact: "+94 47 492 0005",
      website: "www.kataragama.org"
    },
    {
      id: 6,
      name: "Yala National Park",
      type: "Wildlife Safari",
      distance: "60 km",
      duration: "6-8 hours",
      rating: 4.9,
      description: "World-famous for leopards and diverse wildlife. One of Sri Lanka's premier safari destinations.",
      activities: ["Leopard Safari", "Wildlife Photography", "Game Drives"],
      bestTime: "5:30 AM - 6:30 PM",
      contact: "+94 47 492 0006",
      website: "www.yala.com"
    }
  ];

  const quickQuestions = [
    "What are the best nearby attractions?",
    "Tell me about Udawalawe National Park",
    "How far is the Elephant Transit Home?",
    "What activities are available?",
    "Best time to visit these places?",
    "Contact information for attractions"
  ];

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage = {
        id: 1,
        type: 'bot',
        text: "Hi! I'm your friendly travel assistant at Hasthi Safari Cottage! 🏨✨ I'm here to help you discover amazing places around Udawalawe. What would you like to know about nearby attractions?",
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      text: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage('');
    setIsTyping(true);

    setTimeout(() => {
      const fallbackResponse = generateBotResponse(currentInput);
      const botMessage = {
        id: messages.length + 2,
        type: 'bot',
        text: fallbackResponse.text,
        data: fallbackResponse.data,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 800);
  };

  const generateBotResponse = (userInput) => {
    const input = userInput.toLowerCase();

    if (input.includes('nearby') || input.includes('attraction') || input.includes('place')) {
      return {
        text: "Here are the most popular attractions near Hasthi Safari Cottage:",
        data: { type: 'places', places: nearbyPlaces }
      };
    }

    if (input.includes('udawalawe') && input.includes('park')) {
      const park = nearbyPlaces[0];
      return {
        text: `Let me tell you about ${park.name}:`,
        data: { type: 'place_detail', place: park }
      };
    }

    if (input.includes('elephant') && input.includes('transit')) {
      const transitHome = nearbyPlaces[1];
      return {
        text: `${transitHome.name} - A heartwarming experience:`,
        data: { type: 'place_detail', place: transitHome }
      };
    }

    if (input.includes('distance') || input.includes('far') || input.includes('km')) {
      return {
        text: "Here are the distances from Hasthi Safari Cottage:",
        data: { type: 'distances', places: nearbyPlaces.map(p => ({ name: p.name, distance: p.distance })) }
      };
    }

    if (input.includes('activity') || input.includes('do')) {
      return {
        text: "Exciting activities awaiting you:",
        data: { type: 'activities', places: nearbyPlaces }
      };
    }

    if (input.includes('time') || input.includes('best time') || input.includes('when')) {
      return {
        text: "Best visiting times for each attraction:",
        data: { type: 'timings', places: nearbyPlaces.map(p => ({ name: p.name, bestTime: p.bestTime })) }
      };
    }

    if (input.includes('contact') || input.includes('phone') || input.includes('number')) {
      return {
        text: "Contact details for nearby attractions:",
        data: { type: 'contacts', places: nearbyPlaces.map(p => ({ name: p.name, contact: p.contact, website: p.website })) }
      };
    }

    if (input.includes('help') || input.includes('assist')) {
      return {
        text: "I'm here to help! You can ask me about:\n\n• Nearby attractions and places\n• Distances and directions\n• Activities and things to do\n• Best visiting times\n• Contact information\n• Specific details about any attraction\n\nJust type your question or use the quick suggestions below!",
        data: null
      };
    }

    return {
      text: "I'd love to help you explore Udawalawe! Try asking about nearby attractions, distances, activities, or specific places like Udawalawe National Park or the Elephant Transit Home. You can also use the quick suggestions below!",
      data: null
    };
  };

  const handleQuickQuestion = (question) => {
    setInputMessage(question);
    setTimeout(() => handleSendMessage(), 100);
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = (message) => {
    if (message.data?.type === 'places') {
      return (
        <div className="space-y-3">
          <p className="text-gray-700 font-medium mb-4">{message.text}</p>
          <div className="space-y-3">
            {message.data.places.slice(0, 3).map(place => (
              <div 
                key={place.id} 
                className="group relative overflow-hidden bg-white rounded-2xl border-2 border-gray-100 shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:border-[#d3af37]"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-[#d3af37]"></div>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-bold text-[#0a0a0a] text-lg group-hover:text-[#d3af37] transition-colors">{place.name}</h4>
                      <span className="inline-block mt-2 text-xs font-semibold text-gray-600 bg-[#f0f0f0] px-3 py-1.5 rounded-full border border-gray-200">{place.type}</span>
                    </div>
                    <div className="flex items-center bg-[#d3af37] bg-opacity-10 px-3 py-1.5 rounded-full border border-[#d3af37] border-opacity-30">
                      <Star className="w-4 h-4 fill-[#d3af37] text-[#d3af37] mr-1.5" />
                      <span className="text-sm font-bold text-[#d3af37]">{place.rating}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">{place.description}</p>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center bg-[#f0f0f0] px-3 py-2 rounded-xl border border-gray-200">
                      <Navigation className="w-4 h-4 mr-1.5 text-[#d3af37]" />
                      <span className="font-semibold text-[#0a0a0a]">{place.distance}</span>
                    </span>
                    <span className="flex items-center bg-[#f0f0f0] px-3 py-2 rounded-xl border border-gray-200">
                      <Clock className="w-4 h-4 mr-1.5 text-[#d3af37]" />
                      <span className="font-semibold text-[#0a0a0a]">{place.duration}</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 bg-gradient-to-r from-[#d3af37] from-10% to-[#e6c968] rounded-2xl shadow-lg">
            <p className="text-sm text-[#0a0a0a] font-semibold flex items-center">
              <Sparkles className="w-5 h-5 mr-2" />
              Ask me about any specific place for detailed information!
            </p>
          </div>
        </div>
      );
    }

    if (message.data?.type === 'place_detail') {
      const place = message.data.place;
      return (
        <div className="space-y-3">
          <p className="text-gray-700 font-medium mb-3">{message.text}</p>
          <div className="bg-white rounded-2xl overflow-hidden shadow-xl border-2 border-[#d3af37]">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4 pb-4 border-b-2 border-[#f0f0f0]">
                <h4 className="font-bold text-[#0a0a0a] text-xl">{place.name}</h4>
                <div className="flex items-center bg-[#d3af37] px-4 py-2 rounded-full">
                  <Award className="w-5 h-5 text-white mr-2" />
                  <span className="font-bold text-white text-lg">{place.rating}</span>
                </div>
              </div>
              
              <p className="text-gray-600 mb-5 leading-relaxed text-base">{place.description}</p>
              
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="flex items-center bg-[#f0f0f0] p-4 rounded-xl border-2 border-gray-200 hover:border-[#d3af37] transition-all">
                  <div className="bg-[#d3af37] p-3 rounded-xl mr-3">
                    <Navigation className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Distance</p>
                    <p className="text-base font-bold text-[#0a0a0a]">{place.distance}</p>
                  </div>
                </div>
                <div className="flex items-center bg-[#f0f0f0] p-4 rounded-xl border-2 border-gray-200 hover:border-[#d3af37] transition-all">
                  <div className="bg-[#d3af37] p-3 rounded-xl mr-3">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Duration</p>
                    <p className="text-base font-bold text-[#0a0a0a]">{place.duration}</p>
                  </div>
                </div>
                <div className="flex items-center bg-[#f0f0f0] p-4 rounded-xl border-2 border-gray-200 hover:border-[#d3af37] transition-all">
                  <div className="bg-[#d3af37] p-3 rounded-xl mr-3">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Contact</p>
                    <p className="text-xs font-bold text-[#0a0a0a]">{place.contact}</p>
                  </div>
                </div>
                <div className="flex items-center bg-[#f0f0f0] p-4 rounded-xl border-2 border-gray-200 hover:border-[#d3af37] transition-all">
                  <div className="bg-[#d3af37] p-3 rounded-xl mr-3">
                    <Globe className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Website</p>
                    <p className="text-xs font-bold text-[#0a0a0a] truncate">{place.website}</p>
                  </div>
                </div>
              </div>
              
              <div className="mb-5">
                <h5 className="text-sm font-bold text-[#0a0a0a] mb-3 flex items-center">
                  <Camera className="w-5 h-5 mr-2 text-[#d3af37]" />
                  Activities & Experiences
                </h5>
                <div className="flex flex-wrap gap-2">
                  {place.activities.map((activity, idx) => (
                    <span key={idx} className="bg-[#f0f0f0] text-[#0a0a0a] px-4 py-2 rounded-full text-sm font-semibold border-2 border-[#d3af37] border-opacity-30 hover:border-opacity-100 transition-all">
                      {activity}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-[#d3af37] to-[#e6c968] p-4 rounded-xl">
                <div className="flex items-start">
                  <Clock className="w-6 h-6 text-white mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-white mb-1">Best Time to Visit</p>
                    <p className="text-base text-white font-semibold">{place.bestTime}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <p className="text-gray-700 whitespace-pre-line leading-relaxed">{message.text}</p>
        {message.data && (
          <div className="mt-3 space-y-2">
            {message.data.type === 'distances' && message.data.places.map((p, idx) => (
              <div key={idx} className="flex items-center bg-[#f0f0f0] p-3 rounded-xl border-l-4 border-[#d3af37]">
                <Navigation className="w-5 h-5 text-[#d3af37] mr-3" />
                <span className="text-sm text-[#0a0a0a] font-medium"><strong>{p.name}:</strong> {p.distance}</span>
              </div>
            ))}
            {message.data.type === 'timings' && message.data.places.map((p, idx) => (
              <div key={idx} className="flex items-center bg-[#f0f0f0] p-3 rounded-xl border-l-4 border-[#d3af37]">
                <Clock className="w-5 h-5 text-[#d3af37] mr-3" />
                <span className="text-sm text-[#0a0a0a] font-medium"><strong>{p.name}:</strong> {p.bestTime}</span>
              </div>
            ))}
            {message.data.type === 'contacts' && message.data.places.map((p, idx) => (
              <div key={idx} className="bg-[#f0f0f0] p-3 rounded-xl border-l-4 border-[#d3af37]">
                <div className="flex items-center mb-1">
                  <Phone className="w-5 h-5 text-[#d3af37] mr-3" />
                  <span className="text-sm font-bold text-[#0a0a0a]">{p.name}</span>
                </div>
                <p className="text-xs text-gray-600 ml-8 font-medium">{p.contact}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Chatbot Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full shadow-2xl transition-all duration-300 ${
          isOpen 
            ? 'bg-[#0a0a0a] rotate-90 scale-90' 
            : 'bg-[#d3af37] hover:scale-110 hover:shadow-[#d3af37]/50'
        } flex items-center justify-center group`}
      >
        {isOpen ? (
          <X className="w-7 h-7 text-[#f0f0f0]" />
        ) : (
          <div className="relative">
            <MessageCircle className="w-7 h-7 text-[#0a0a0a]" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#0a0a0a] rounded-full animate-pulse"></span>
          </div>
        )}
      </button>

      {/* Chatbot Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-[450px] h-[700px] bg-white rounded-3xl shadow-2xl border-2 border-[#d3af37] overflow-hidden flex flex-col animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#0a0a0a] to-[#1a1a1a] p-6 text-[#f0f0f0] border-b-2 border-[#d3af37]">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#d3af37] to-[#b8971f] rounded-full flex items-center justify-center shadow-lg">
                  <Heart className="w-6 h-6 text-[#0a0a0a]" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-[#f0f0f0]">Hasthi Travel Assistant</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="w-2.5 h-2.5 bg-[#d3af37] rounded-full animate-pulse"></div>
                    <p className="text-sm text-[#d3af37] font-medium">Online & Ready to Help</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-10 h-10 bg-[#d3af37] hover:bg-[#b8971f] rounded-full flex items-center justify-center transition-colors duration-200 shadow-lg"
                title="Close chat"
              >
                <X className="w-5 h-5 text-[#0a0a0a]" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-6 overflow-y-auto bg-[#f0f0f0]">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`mb-4 ${message.type === 'user' ? 'text-right' : 'text-left'} animate-in slide-in-from-bottom-2 duration-300`}
              >
                <div
                  className={`inline-block max-w-[85%] p-4 ${
                    message.type === 'user'
                      ? 'bg-[#d3af37] text-[#0a0a0a] rounded-3xl rounded-tr-md shadow-lg'
                      : 'bg-white text-[#0a0a0a] rounded-3xl rounded-tl-md shadow-md border-2 border-gray-200'
                  }`}
                >
                  {renderMessage(message)}
                  <div className={`text-xs mt-2 font-medium ${message.type === 'user' ? 'text-[#0a0a0a] opacity-70' : 'text-gray-400'}`}>
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="text-left mb-4 animate-in slide-in-from-bottom-2 duration-300">
                <div className="inline-block bg-white p-4 rounded-3xl rounded-tl-md shadow-md border-2 border-gray-200">
                  <div className="flex space-x-1">
                    <div className="w-2.5 h-2.5 bg-[#d3af37] rounded-full animate-bounce"></div>
                    <div className="w-2.5 h-2.5 bg-[#d3af37] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2.5 h-2.5 bg-[#d3af37] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length === 1 && (
            <div className="p-6 bg-white border-t-2 border-[#d3af37]">
              <p className="text-xs font-bold text-[#0a0a0a] mb-3 flex items-center">
                <Sparkles className="w-4 h-4 mr-2 text-[#d3af37]" />
                Quick Suggestions:
              </p>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.slice(0, 3).map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestion(question)}
                    className="text-xs bg-[#f0f0f0] hover:bg-[#d3af37] text-[#0a0a0a] hover:text-[#0a0a0a] px-3 py-2 rounded-full transition-all duration-200 border-2 border-[#d3af37] border-opacity-30 hover:border-opacity-100 font-semibold shadow-sm hover:shadow-md flex items-center group"
                  >
                    {question}
                    <ChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-6 bg-white border-t-2 border-[#d3af37]">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask about nearby places..."
                className="flex-1 p-3 pl-5 border-2 border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#d3af37] focus:border-[#d3af37] transition-all text-sm bg-[#f0f0f0] focus:bg-white font-medium text-[#0a0a0a]"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim()}
                className="w-12 h-12 bg-[#d3af37] text-[#0a0a0a] rounded-full flex items-center justify-center hover:bg-[#e6c968] transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg transform hover:scale-105 active:scale-95"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;