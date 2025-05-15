"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isloading, setIsLoading] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    if (!email || !password) {
      setError("All fields are necessary");
      setIsLoading(false);
      return;
    }
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res.error) {
        setError("Invalid Credentials");
        setIsLoading(false);
        return;
      }
      setIsLoading(false);
      router.replace("dashboard");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen space-y-10">
      <div className="flex lg:flex-row flex-col justify-center items-center space-y-2 lg:space-x-4 cursor-default font-mono">
        <h1 className="text-4xl pt-1">📝 SWAN-AI</h1>
        <h1 className="text-4xl">Annotation</h1>
        <h1 className="text-4xl">Tool</h1>
      </div>
      <div className="p-5 rounded-lg border-2 border-dashed">
        <h1 className="text-xl font-bold my-4 text-center">Login</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            onChange={(e) => setEmail(e.target.value)}
            type="text"
            placeholder="Username"
            className=" w-72 bg-stone-100 px-4 py-2 rounded-lg"
          />
          <div className="relative">
            <input
              onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-72 bg-stone-100 px-4 p-2 rounded-lg"
            />
            <FontAwesomeIcon
              icon={showPassword ? faEye : faEyeSlash}
              className="absolute right-3 top-1/2 w-5 -translate-y-1/2 text-stone-300 text-lg cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            />
          </div>
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
              <p>Login</p>
            )}
          </button>
          {error && (
            <div className="bg-red-500 text-white w-fit text-sm py-1 px-3 rounded-md mt-2">
              {error}
            </div>
          )}
        </form>
        <div className="flex flex-row justify-end mt-3 space-x-2 items-end text-sm">
          <p>Don't have an account?</p>
          <Link className="text-sm underline" href={"/register"}>
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
