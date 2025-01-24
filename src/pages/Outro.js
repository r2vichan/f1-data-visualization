import React, { useState, useEffect, useRef } from 'react';
import './outroResources/Outro.css';

const QUOTES = [
    {
        quote: "F1 is our open-air research and development laboratory since 1950",
        author: "-- Pirelli"
    },
    {
        quote: "...Mercedes-Benz offering a wide range of Plug-In Hybrid models that feature learnings taken directly from F1's development of the Hybrid Power Unit systems.",
        author: "-- Mercedes-Benz"
    },
    {
        quote: "Racing is for Pirelli the highest valuable technical transfer for the development of road tires.",
        author: "-- Pirelli"
    },
    {
        quote: "Honda will be using cutting-edge technology it learned from the world of Formula 1 in order to enhance its next generation of EVs.",
        author: "-- Honda"
    },
    {
        quote: "Formula 1 created the most efficient hybrid system ever built, but now they are intensifying their efforts to develop a 100% sustainable drop-in fuel from renewable bio-waste – a fuel that could be used in cars and trucks round the world.",
        author: "-- DHL"
    },
    {
        quote: "The first is that we want racing, more and more, to inform our production vehicles. ... We actually want to sell street legal race cars, lots of them.",
        author: "-- Ford"
    },
    {
        quote: "McLaren is helping Network Rail maintain the railway following the installation of its F1-derived Fleet Connect software and 5G Edge Active Antenna hardware on 14 of the railway operator’s infrastructure monitoring trains.",
        author: "-- McLaren"
    }
]

function Outro() {
    var [quote, setQuote] = useState("")
    var [author, setAuthor] = useState("")
    var [key, setKey] = useState(100)
    var [animationClass, setAnimationClass] = useState("")
    const f1LogoRef = useRef(null);

    useEffect(() => {
        const showQuotes = async () => {
            for(var i = 0; i < QUOTES.length; i++) {
                setQuote(QUOTES[i].quote)
                setAuthor(QUOTES[i].author)
                setAnimationClass("animateEnter")
                setKey(key => key+1)
                await new Promise((resolve) => setTimeout(resolve, 8000)) // Wait for animation 3s + Read time 5s
                setAnimationClass("animateExit")
                await new Promise((resolve) => setTimeout(resolve, 3000)) // Wait for animation 3s
            }
            if(f1LogoRef.current)
                f1LogoRef.current.className = "animateEnter"
        }
        showQuotes()
    }, []);

    return (
      <div className="idiom-containerM" id="quoteContainer" style={{padding:30}}>
        <div key={key} id="quoteDiv" className={animationClass}>
            <p>"{quote}"</p>
            <p>{author}</p>
        </div>
        <img ref={f1LogoRef} id="outroF1Logo" src={`${process.env.PUBLIC_URL}/f1.png`}/>
      </div>
    );
  }
  
  export default Outro;