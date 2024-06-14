// pages/index.tsx
"use client";

import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import ProductCard from "./productCard"; // Make sure this component is typed as well
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import logo from "../../public/ai.png"; // Adjust the path as needed
import Header from "./header";

// interface Product {
//   name: string;
//   description: string;
//   similar_products: string[];
//   image?: string;
//   url?: string;
// }

const HomePage = () => {
  const [loading, setLoading] = useState(false);
  const [finalData, setFinalData] = useState([]);
  const [cameraView, setCameraView] = useState("user");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const searchKey = process.env.NEXT_PUBLIC_SEARCH_API!;
  const cxKey = process.env.NEXT_PUBLIC_CX_ID!;

  useEffect(() => {
    startCamera();
  }, [cameraView]);

  const startCamera = () => {
    navigator.mediaDevices
      .getUserMedia({
        video: {
          facingMode: cameraView,
          width: 1920,
          height: 1080,
        },
      })
      .then((stream) => {
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
        }
      })
      .catch((err) => {
        console.log("An error occurred: " + err);
      });
  };

  const changeCamera = () => {
    setCameraView(cameraView === "user" ? "environment" : "user");
  };

  const getProductImage = async (productName: string): Promise<string> => {
    const apiKey = searchKey;
    const cx = cxKey;
    const apiUrl = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&searchType=image&q=${encodeURIComponent(
      productName
    )}`;

    try {
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (data.items && data.items.length > 0) {
        const imageUrl = data.items[1].link;
        return imageUrl;
      } else {
        return "";
      }
    } catch (error) {
      console.error("Error fetching product image:", error);
      return "";
    }
  };

  const getURL = (productName: string): string => {
    const baseUrl = "https://www.google.com/search";
    const queryParams = new URLSearchParams({
      tbm: "shop",
      q: productName.replace(/\s+/g, "+"),
    });
    return `${baseUrl}?${queryParams}`;
  };

  const getData = async () => {
    setLoading(true);
    setFinalData([]);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      const context = canvas.getContext("2d");
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const dataURL = canvas
          .toDataURL("image/png")
          .split("data:image/png;base64,")[1];

        const MODEL_NAME = "gemini-1.5-pro-latest";
        // const API_KEY = "AIzaSyCKmk8zCAY_pcjqI_haNsm3yPqiJqvu21I"; // virjraj api key
        const API_KEY = "AIzaSyDKFx1hj7oD8Yay21gO4XIhp2gJH8Mbhx8";
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: MODEL_NAME });
        const generationConfig = {
          temperature: 0.9,
          topK: 1,
          topP: 1,
          maxOutputTokens: 30720,
        };
        const safetySettings = [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
        ];
        const parts = [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: dataURL,
            },
          },
          {
            text: `
              Identify multiple objects in the image and provide information about each object, including its name, company, description, and 
              similar products based on product details and
              ignore the object such as human, man, woman and child.

              Example:
              Given the image, identify the products and their respective companies. For each product detected:
              
              1. Name of the product:
              2. Product description (in 100 words max):
              3. 4 Similar products (if any):
              
              Return the data in the following JSON template:
              
              [
                  {
                      "name": "Name of the product",
                      "description": "This product is used for ABC and its use cases are XYZ.",
                      "similar_products": ["Similar Product 1", "Similar Product 2", "Similar Product 3", "Similar Product 4", ...]
                  },
                  {
                      "product_name": "Name of another product",
                      "description": "This product is used for DEF and its use cases are UVW.",
                      "similar_products": ["Similar Product A", "Similar Product B", "Similar Product C", "Similar Product D", ...]
                  },
                  ...
              ]

              remove ... from similar_products from the results and remove json word
              
              `,
          },
        ];

        try {
          const result = await model.generateContent({
            contents: [{ role: "user", parts }],
            generationConfig,
            safetySettings,
          });
          const response = result.response;
          const res = JSON.parse(response.text().replace(/\n/g, ""));
          const finalData: any = await Promise.all(
            res.map(async (p: any) => {
              p.image = await getProductImage(p.name);
              p.url = getURL(p.name);
              return p;
            })
          );
          setFinalData(finalData);
        } catch (error) {
          console.error("Error:", error);
          setFinalData([]);
        }
      }
    }
    setLoading(false);
  };

  return (
    <>
      <Header />
      <main
        className={`bg-gray-300 ai-font min-h-screen flex flex-col justify-center items-center ${
          finalData.length ? "fill-height" : "fill-height"
        }`}
      >
        <div
          className={`max-w-screen-xl mx-auto ${
            finalData.length ? "mt-4" : "fill-height"
          } p-4`}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between bg-white shadow-md rounded-lg p-6 mb-4">
            {/* Logo and Description */}
            <div className="w-full sm:w-1/2 text-center sm:text-left p-4">
              <div className="w-full flex justify-center">
                <Image
                  src={logo}
                  width={500}
                  alt="Logo"
                  className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl"
                />
              </div>
              <p className="text-lg mt-4 text-blue-800">
                Explore product details directly from videos and get
                recommendations for similar items.
              </p>
            </div>
            {/* Video and Camera View */}
            <div className="w-full sm:w-1/2 text-center p-4 relative ">
              <video
                ref={videoRef}
                className="w-full rounded-md shadow-md"
                autoPlay
              ></video>
              <canvas
                ref={canvasRef}
                width="1280"
                height="720"
                style={{ display: "none" }}
              ></canvas>
            </div>
          </div>
          {/* Controls and Camera Switch */}
          <div className="text-center mt-4">
            <p className="text-lg font-semibold text-gray-600">
              <b>Camera View:</b>{" "}
              {cameraView === "user" ? "Front Camera" : "Back Camera"}
            </p>
            <div className="mt-4 space-x-4">
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-full transition duration-300"
                onClick={getData}
                disabled={loading}
              >
                {loading ? "Loading..." : "Search for Product"}
              </button>
              <button
                className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-full transition duration-300"
                onClick={changeCamera}
              >
                Change Camera
              </button>
            </div>
          </div>
        </div>
        {/* Results Section */}
        {finalData.length > 0 && (
          <div className="max-w-screen-xl mx-auto text-left mt-10 mb-10 p-4">
            <h2 className="text-3xl font-bold mb-6 text-gray-600">
              Results ({finalData.length})
            </h2>
            <p className="text-sm mb-6 text-gray-600">
              This tool may display inaccurate info, including product, image,
              and product model; double-check its responses.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {finalData.map((data, index) => (
                <ProductCard product={data} key={index} />
              ))}
            </div>
          </div>
        )}
      </main>
    </>
  );
};

export default HomePage;
