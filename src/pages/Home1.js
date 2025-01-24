import React, { useRef, useEffect, useState } from "react";
import { Scrollama, Step } from "react-scrollama";
import 'bootstrap/dist/css/bootstrap.min.css';
import "./Home1.css";
import introVideo from "../data/f1_video.mp4";
import f1logo from "./formula-1-logo.png";
import Idiom2 from "./Idiom2";
import Idiom3 from "./Idiom3";
import Idiom4 from "./Idiom4";
import Idiom5 from "./Idiom5";
import Idiom1 from "./Idiom1";
import Outro from "./Outro";

function Home1() {
    const stepTexts = {
        1: [
            "But, all this speed comes at a cost",
        ],
        2: [
            "So where does safety stand?",
            "Now, let's plot the previous graph with respect to time"
        ],
        3: [
            "One major aspect of safety is improving the reliability of the car while maintaining speeds.",
        ],
        4: [
            "Speed has always been at the heart of F1",
            "Even with various engine regulation changes aimed at increasing safety, lap times have always reduced",
            "These include pit stop safety measures, track improvements, car reliability standards, etc.",
        ],
        5: [
            "Speed in F1 doesn't stop on the tracks, it even spills out into the pitlanes.",
        ]
    };

    const outroTexts = {
        1: [
            "Crashes, failures, extreme weather conditions are a commonplace in F1 which lead to accidents."
        ],
        2: [
            "We see decreasing trend in the number of incidents with time.",
            "The death of F1 legend Senna in 1994, sparked several FIA regulations to improve safety.",
        ],
        3: [
            "At extreme speeds, with a more reliable car, drivers are more confident in pushing the limits.",
            "But still...",
            "Why go through all this?",
            "It's because F1's impacts go beyond the race track."
        ],
        4: [
            "We see a general trend of lowering lap times. Outliers that you see are due to extreme weather conditions and early crashes.",
        ],
        5: [
            "The modern F1 pitstop takes roughly 30 seconds. The following things happen:",
            "Car needs to enter the pitlane and align in the pitbox (10s)",
            "Car needs to be jacked up (1s)",
            "4 tyres need to be replaced (3s)",
            "Optional repairs are made (5s)",
            "Car needs to be lowered and the driver signalled to go (1s)",
            "Car exits the pitlane and joins the track (10s)"
        ]
    };
    const [currentStepIndex, setCurrentStepIndex] = useState(null);
    const [currentIdiomIndex, setCurrentIdiomIndex] = useState(null);
    const [isIdiomVisible, setIsIdiomVisible] = useState(false);
    const [outroKey, setOutroKey] = useState(0);

    const onStepEnter = ({ data }) => {
        setCurrentStepIndex(data);
    };

    const debounce = (func, delay) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), delay);
        };
    };

    const debouncedStepEnter = debounce(onStepEnter, 50);

    const onStepExit = ({ data, direction }) => {
        if (direction === "up") {
            setCurrentStepIndex(data - 1); // Handle scrolling back
        }
    };

    const onIdiomStepEnter = ({ data }) => {
        const { idiomId, stepIndex } = data;

        // Example logic to handle idiomId and stepIndex
        setCurrentIdiomIndex(idiomId);

        if (stepIndex === "extra-last") {
            setIsIdiomVisible(false);
        }

        if (idiomId === currentIdiomIndex && stepIndex === "extra") {
            setIsIdiomVisible(true);
        } else {
            setIsIdiomVisible(false);
        }
    };

    return (
        <>
        <div className="home1-container">
            {/* Intro Section */}
            <div className="full-page-container1">
                {/* Full-page image and title */}
                <div className="image1-container">
                    <img src={f1logo} alt="F1 Logo" style={{marginBottom:50}}/>
                    <h1 className="image1-title"><strong>Formula 1</strong></h1>
                    <h2 className="image1-title">Speed vs Safety</h2>
                </div>
            </div>
            </div>

            <div className="home1-container2">
            <div className="full-page-container1">
                <p style={{fontSize:80}}>What is F1?</p>
                <p style={{fontSize:30,textAlign:"justify"}}>Formula 1 (F1) is the world's premier motorsport competition, featuring high-performance
                    single-seater cars that race on circuits and city streets across the globe. Governed by the Fédération Internationale de l’Automobile (FIA), F1 combines cutting-edge engineering, strategic innovation, and elite driving skills to deliver thrilling, high-speed races. Teams compete using cars designed within strict regulations to ensure safety and fairness while pushing the boundaries of technology. With speeds exceeding 200 mph, F1 is known for its intense rivalries, global fanbase, and influence on automotive advancements, making it a symbol of precision, power, and passion.</p>
            </div>
            </div>


            <div className="home1-container3">

            <div className="full-page-container1" style={{textAlign:"center"}}>
                <p style={{fontSize:100,marginTop:200}}>Bored?</p>
            </div>
            </div>

            <div className="home1-container">

            {/* Sticky Car Image and Scrollable Text Sections */}
            <div className="sticky1-container">
                <div className="sticky1-video">
                    <video autoPlay loop muted playsInline>
                        <source src={introVideo} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                </div>
                <Scrollama offset={1} onStepEnter={debouncedStepEnter} onStepExit={onStepExit}>
                    <Step data={1} key={1}>
                        <div className={`scroll-sectionx ${currentStepIndex === 1 ? "active" : ""}`}>
                            <p>
                                Maybe this is more like it.
                            </p>
                        </div>
                    </Step>
                    <Step data={2} key={2}>
                        <div className={`scroll-sectionx ${currentStepIndex === 2 ? "active" : ""}`}>
                            <p>
                                Formula 1 is all about pure speed, racing, innovation and spectacle.
                            </p>
                        </div>
                    </Step>
                    <Step data={3} key={3}>
                        <div className={`scroll-sectionx ${currentStepIndex === 3 ? "active" : ""}`}>
                            <p>
                                But, this thrill comes with its own perils.
                            </p>
                        </div>
                    </Step>
                    <Step data={4} key={4}>
                        <div className={`scroll-sectionx ${currentStepIndex === 4 ? "active" : ""}`}>
                            <p>
                                Can speed and safety truly coexist? Let's find out!
                            </p>
                        </div>
                    </Step>
                    <Step data={5} key={5}>
                        <div className={`scroll-sectionx ${currentStepIndex === 4 ? "" : ""} last-scroll-section`}>
                        </div>
                    </Step>
                </Scrollama>
            </div>

            {/* Idiom Section */}
            <div className="idiom-containerx">
                {[
                    { id: 4, title: "Lap Times over Seasons", component: <Idiom4 /> },
                    { id: 5, title: "Pitstop Duration Vs Time", component: <Idiom5 /> },
                    { id: 1, title: "Accidents Vs Circuit", component: <Idiom1 /> },
                    { id: 2, title: "Incidents over Time", component: <Idiom2 /> },
                    { id: 3, title: "Car Reliability Vs Time", component: <Idiom3 /> }
                ].map((idiom) => (
                    <div key={idiom.id} className="idiom-wrapperx">
                        <div className="sticky-titlex">{idiom.title}</div>
                        <div className={`idiom-sectionx ${isIdiomVisible ? "active" : "blurred"}`}>
                            <div className="idiom-contentx">{idiom.component}</div>
                        </div>
                        <Scrollama offset={1} onStepEnter={onIdiomStepEnter}>
                            {stepTexts[idiom.id].map((text, stepIndex) => (
                                <Step key={stepIndex} data={{ idiomId: idiom.id, stepIndex: stepIndex + 1 }}>
                                    <div className="scroll-stepx">
                                        <p>{text}</p>
                                    </div>
                                </Step>
                            ))}
                            <Step key={`extra-${idiom.id}-1`} data={{ idiomId: idiom.id, stepIndex: "extra" }}>
                                <div className="scroll-step-last">
                                </div>
                            </Step>
                            <Step key={`extra-${idiom.id}-2`} data={{ idiomId: idiom.id, stepIndex: "extra" }}>
                                <div className="scroll-step-last">
                                </div>
                            </Step>
                            {outroTexts[idiom.id].map((text, stepIndex) => (
                                <Step key={`outro-${stepIndex}`} data={{ idiomId: idiom.id, stepIndex: stepIndex + 1 }}>
                                    <div className="scroll-stepx">
                                        <p>{text}</p>
                                    </div>
                                </Step>
                            ))}
                            <Step key={`extra-${idiom.id}-3`} data={{ idiomId: idiom.id, stepIndex: "extra-last" }}>
                                <div className="scroll-step-last">
                                </div>
                            </Step>
                        </Scrollama>
                    </div>
                ))}
            </div>

            <Scrollama offset={0.5} onStepEnter={() => { setOutroKey(k => k + 1) }}>
                <Step>
                    <div className="idiom-containerx">
                        < Outro key={outroKey} />
                    </div>
                </Step>
            </Scrollama>

        </div>
        </>
    );
}

export default Home1;