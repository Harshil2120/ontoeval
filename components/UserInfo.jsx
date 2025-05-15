"use client";

import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import Openright from "@/components/Openright";
import Closeright from "@/components/Closeright";

import React, { useState, useEffect, useRef } from "react";

const getTopics = async (myemail) => {
  try {
    const res = await fetch(`/api/usertwos/${myemail}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Failed to fetch topics");
    }

    return res.json();
  } catch (error) {
    console.log("Error loading topics: ", error);
  }
};

const UserInfo = () => {
  const { data: session } = useSession();
  const myemail = session?.user?.email;
  const [topics, setTopics] = useState([]);

  const [isrightOpen, setIsRightOpen] = useState(false);

  const [currentTopicIndex, setCurrentTopicIndex] = useState(0);

  const [isVisible, setIsVisible] = useState(false);
  const [visible, setVisible] = useState(false);

  const [selectedresValue, setSelectedresValue] = useState("");
  const [comments, setComments] = useState("");

  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    if (!session) {
      signOut();
    }
  }, [session]);

  useEffect(() => {
    if (showAlert) {
      const timer = setTimeout(() => {
        setShowAlert(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [showAlert]);

  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }

    if (topics[currentTopicIndex]?.annotate) {
      const currentAnnotate = topics[currentTopicIndex].annotate;

      // Restore radio button selections
      setSelectedresValue(currentAnnotate.response || "");

      // Restore comments
      setComments(currentAnnotate.comment || "");
    }
  }, [currentTopicIndex, topics]);

  const handleRadioChange = (event) => {
    setSelectedresValue(event.target.value);
  };

  const handleCommentsChange = (event) => {
    setComments(event.target.value);
  };

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [currentTopicIndex]);

  useEffect(() => {
    getTopics(myemail)
      .then((data) => {
        setTopics(data.topic);
      })
      .catch((error) => {
        console.error("Error loading topics: ", error);
      });
  }, []);

  const submitCurrentQuestion = async () => {
    topics[currentTopicIndex].annotate.response = selectedresValue;
    topics[currentTopicIndex].annotate.comment = comments;
    topics[currentTopicIndex].edited = "yes";
    topics[currentTopicIndex].answered = "Answered";

    const obj = {
      questionSerial: topics[currentTopicIndex].serial,
      annotate: {
        question: topics[currentTopicIndex].annotate.question,
        comment: topics[currentTopicIndex].annotate.comment,
        response: topics[currentTopicIndex].annotate.response,
      },
      answered: topics[currentTopicIndex].answered,
      edited: topics[currentTopicIndex].edited,
    };

    const response = await fetch(`/api/usertwos/${myemail}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(obj),
    });

    if (!response.ok) {
      throw new Error(`Failed to update topic: ${response.statusText}`);
    }

    await response.json();
    setShowAlert(true);
  };

  // Navigation handlers
  const handleNextClick = async () => {
    if (currentTopicIndex < topics.length - 1) {
      try {
        await submitCurrentQuestion();
        setCurrentTopicIndex(currentTopicIndex + 1);
        setIsVisible(false);
      } catch (error) {
        setShowAlert(false);
        console.log("Error updating topic: ", error);
      }
    }
  };

  const handleBackClick = async () => {
    if (currentTopicIndex > 0) {
      try {
        await submitCurrentQuestion();
        setCurrentTopicIndex(currentTopicIndex - 1);
        setIsVisible(false);
      } catch (error) {
        setShowAlert(false);
        console.log("Error updating topic: ", error);
      }
    }
  };

  const handleClick = (index) => {
    setCurrentTopicIndex(index);
  };

  return (
    <>
      {topics.length > 0 && (
        <div className="pr-6 h-screen">
          <nav className="w-full bg-white px-6 py-2">
            <div
              className={`flex justify-between rounded-2xl ${
                topics[currentTopicIndex].answered === "Answered"
                  ? "bg-green-200"
                  : "bg-pink-200"
              }`}
            >
              <h1 className="p-4 text-lg">
                {topics[currentTopicIndex].serial}
              </h1>
              <h3 className="text-green-400 p-4 text-lg font-bold">
                {topics[currentTopicIndex].answered}
              </h3>
              <button
                onClick={() => signOut()}
                className="bg-red-500 rounded-lg flex text-white justify-center items-center space-x-2 p-2 m-2"
              >
                <p>Log out</p>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-log-out"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" x2="9" y1="12" y2="12" />
                </svg>
              </button>
            </div>

            <div className="space-x-3 text-md">
              <h1>Question</h1>
              <h2 className=" bg-emerald-100 p-2 rounded-md mb-1">
                {topics[currentTopicIndex].annotate.question}
              </h2>
            </div>
          </nav>

          <div
            className="overflow-scroll border-b-2 h-96 border-t-2 border-dashed border-slate-600 pb-24"
            ref={scrollRef}
          >
            {topics[currentTopicIndex]?.serial === 83 ? (
              // Completed message only
              <div className="flex justify-center my-4">
                <div className="bg-green-100 border text-center border-green-400 text-green-700 px-6 py-3 rounded shadow-md">
                  <strong className="font-bold">
                    🎉 Completed! You have completed all the question.
                  </strong>
                </div>
              </div>
            ) : topics[currentTopicIndex]?.serial > 77 ? (
              // Only comment box
              <div className="flex flex-col justify-center space-x-3 space-y-1 p-3">
                <h1>Feedback</h1>
                <form className="flex flex-col border border-dashed border-gray-600 rounded p-3 flex-grow">
                  <textarea
                    className="mt-2 p-2 border rounded"
                    placeholder="Add your comments here"
                    value={comments}
                    onChange={handleCommentsChange}
                  ></textarea>
                </form>
              </div>
            ) : topics[currentTopicIndex]?.serial > 57 ? (
              // Binary question UI
              <div className="lg:flex justify-center lg:space-x-3 space-y-1 m-3">
                <form className="flex flex-col border border-dashed flex-grow border-gray-600 rounded p-3 lg:w-1/3">
                  <div className="flex">
                    <label>
                      <input
                        type="radio"
                        value="Yes"
                        checked={selectedresValue === "Yes"}
                        onChange={handleRadioChange}
                      />
                      <span>Yes</span>
                    </label>
                    <label>
                      <input
                        type="radio"
                        value="No"
                        checked={selectedresValue === "No"}
                        onChange={handleRadioChange}
                      />
                      <span>No</span>
                    </label>
                    <label>
                      <input
                        type="radio"
                        value="N/A"
                        checked={selectedresValue === "N/A"}
                        onChange={handleRadioChange}
                      />
                      <span>N/A</span>
                    </label>
                  </div>
                  <textarea
                    className="mt-2 p-2 border rounded"
                    placeholder="Add your comments here"
                    value={comments}
                    onChange={handleCommentsChange}
                  ></textarea>
                </form>
              </div>
            ) : (
              // Likert scale question UI
              <div className="flex justify-center space-x-3 space-y-1 p-3">
                <form className="flex flex-col border border-dashed border-gray-600 rounded p-3 flex-grow">
                  <div className="flex">
                    <label>
                      <input
                        type="radio"
                        value="Strongly Disagree"
                        checked={selectedresValue === "Strongly Disagree"}
                        onChange={handleRadioChange}
                      />
                      <span>Strongly Disagree</span>
                    </label>

                    <label>
                      <input
                        type="radio"
                        value="Disagree"
                        checked={selectedresValue === "Disagree"}
                        onChange={handleRadioChange}
                      />
                      <span>Disagree</span>
                    </label>

                    <label>
                      <input
                        type="radio"
                        value="Neutral"
                        checked={selectedresValue === "Neutral"}
                        onChange={handleRadioChange}
                      />
                      <span>Neutral</span>
                    </label>

                    <label>
                      <input
                        type="radio"
                        value="Agree"
                        checked={selectedresValue === "Agree"}
                        onChange={handleRadioChange}
                      />
                      <span>Agree</span>
                    </label>

                    <label>
                      <input
                        type="radio"
                        value="Strongly Agree"
                        checked={selectedresValue === "Strongly Agree"}
                        onChange={handleRadioChange}
                      />
                      <span>Strongly Agree</span>
                    </label>
                  </div>
                  <textarea
                    className="mt-2 p-2 border rounded"
                    placeholder="Add your comments here"
                    value={comments}
                    onChange={handleCommentsChange}
                  ></textarea>
                </form>
              </div>
            )}
          </div>

          <div className="fixed bottom-0 w-full bg-white flex-col items-center">
            <div className="flex flex-col items-center">
              {!isVisible && (
                <div
                  className="bg-gray-100 border text-center border-gray-400 text-gray-700 px-4 py-3 rounded relative"
                  role="alert"
                >
                  <strong className="font-bold">
                    Clicking Next/Back will submit the answer. You can navigate
                    to other questions from sidebar.
                  </strong>
                </div>
              )}
            </div>
            <div className=" text-center space-x-8 p-2">
              <button
                className=" bg-red-700 text-white font-bold py-2 px-4 rounded hover:disabled:cursor-not-allowed"
                onClick={handleBackClick}
                disabled={currentTopicIndex === 0}
              >
                Back
              </button>
              {/* <button
                className=" bg-blue-600  text-white font-bold py-2 px-4 rounded hover:disabled:cursor-not-allowed"
                type="submit"
                onClick={handleSubmit}
              >
                Submit
              </button> */}
              <button
                className=" bg-green-600 text-white font-bold py-2 px-4 rounded hover:disabled:cursor-not-allowed"
                onClick={handleNextClick}
                disabled={currentTopicIndex === topics.length - 1}
              >
                Next
              </button>
            </div>

            <div
              className={`fixed right-10 z-10 bg-green-100 border max-w-lg text-center border-green-400 text-green-700 px-4 py-3 rounded shadow-lg transition-all duration-500 ${
                showAlert ? "-translate-y-[120%]" : "translate-y-full "
              }`}
              role="alert"
            >
              <strong className="font-bold">Submitted!</strong>
            </div>
          </div>
        </div>
      )}

      <div
        className={`fixed flex bg-gray-800 justify-center items-center right-0 top-0 z-30 h-full w-96 py-2 pr-2 transition-all duration-300 ${
          isrightOpen ? "translate-x-0" : "translate-x-[22.5rem]"
        }`}
        aria-label="Sidebar"
      >
        <button className=" text-white rounded-md">
          {isrightOpen ? (
            <Closeright onClick={() => setIsRightOpen(false)} />
          ) : (
            <Openright onClick={() => setIsRightOpen(true)} />
          )}
        </button>

        <div className="h-full flex-grow overflow-y-auto p-3 space-y-2 bg-gray-700 rounded-3xl flex flex-col">
          <div className="bg-gray-600 p-4 rounded-xl text-center">
            <h3 className="text-white">Total data points: {topics.length}</h3>
          </div>
          <div className="bg-gray-500 rounded-lg h-fit w-fit flex flex-wrap justify-center text-white items-center p-2">
            {topics.map((item, index) => (
              <div
                key={item._id}
                className={`px-1 border border-black ${
                  index === currentTopicIndex
                    ? "bg-yellow-500"
                    : `${
                        item.edited == "yes" ? "bg-green-500" : "bg-pink-500 "
                      }`
                } h-fit w-fit rounded-sm cursor-pointer m-1`}
                onClick={() => handleClick(index)}
              >
                {index + 1}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default UserInfo;
