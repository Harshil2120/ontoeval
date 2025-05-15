"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";

const getQuestions = async () => {
  try {
    const res = await fetch("/api/questions", {
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

export default function RegisterForm() {
  const [questions, setQuestions] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cpassword, setCPassword] = useState("");
  const [isloading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  useEffect(() => {
    getQuestions()
      .then((data) => {

        const sortedQuestions = data.questions.sort(
          (a, b) => a.serial - b.serial
        );
        setQuestions(sortedQuestions);
      })
      .catch((error) => {
        console.error("Error loading topics: ", error);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    if (!name || !email || !password || !cpassword) {
      setError("All fields are necessary");
      setIsLoading(false);
      return;
    }
    if (password !== cpassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const resUserExists = await fetch("api/userExists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const { user } = await resUserExists.json();

      if (user) {
        setError("User already exists");
        setIsLoading(false);
        return;
      }

      console.log("Data questions:", questions);

      const res = await fetch("api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          questions,
        }),
      });

      if (res.ok) {
        const form = e.target;
        form.reset();
        setIsLoading(false);
        router.push("/");
      } else {
        console.log("User registration failed");
      }
    } catch (error) {
      console.log("Error during registration: ", error);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen space-y-10">
      <div className="flex lg:flex-row flex-col justify-center items-center space-y-2 lg:space-x-4 cursor-default font-mono">
        <h1 className="text-4xl pt-1">📝 SWAN-AI</h1>
        <h1 className="text-4xl">Annotation</h1>
        <h1 className="text-4xl">Tool</h1>
      </div>
      <div className="flex lg:flex-row flex-col justify-center items-center space-y-2 lg:space-x-4 cursor-default">
        <p className="text-xl bg-yellow-100 rounded-md">
          Note: Please keep a simple Username and Password which you can
          remember.
        </p>
      </div>
      <div className="p-5 rounded-lg border-2 border-dashed">
        <h1 className="text-xl font-bold my-4 text-center">Register</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            onChange={(e) => setName(e.target.value)}
            type="text"
            placeholder="Full Name"
            className=" w-72 bg-stone-100 px-4 py-2 rounded-lg"
          />
          <input
            onChange={(e) => setEmail(e.target.value)}
            type="text"
            placeholder="Username"
            className=" w-72 bg-stone-100 px-4 py-2 rounded-lg"
          />
          <input
            onChange={(e) => setPassword(e.target.value)}
            type="text"
            placeholder="Password"
            className=" w-72 bg-stone-100 px-4 py-2 rounded-lg"
          />
          <input
            onChange={(e) => setCPassword(e.target.value)}
            type="text"
            placeholder="Confirm Password"
            className=" w-72 bg-stone-100 px-4 py-2 rounded-lg"
          />
          <button
            className={`bg-blue-500 rounded-md text-white flex justify-center font-bold cursor-pointer px-6 py-2 ${
              isloading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={isloading}
          >
            {isloading ? (
              <img
                src="/Dual Ring-1s-200px.svg"
                className="h-8"
                alt="Loading"
              />
            ) : (
              <p>Register</p>
            )}
          </button>

          {error && (
            <div className="bg-red-500 text-white w-fit text-sm py-1 px-3 rounded-md mt-2">
              {error}
            </div>
          )}
        </form>
        <div className="flex flex-row justify-end mt-3 space-x-2 items-end text-sm">
          <p>Already have an account?</p>
          <Link className="text-sm underline" href={"/"}>
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
