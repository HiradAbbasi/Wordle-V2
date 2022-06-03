import './App.css';
import React, { useState, useEffect } from 'react';
import rawAllowed from '../src/allowed.txt';
import { firebase, db } from "../src/firebase";

function App() {
  const splitToChunks = (arrayvar, parts) => {
    let result = [];
    for (let i = parts; i > 0; i--) {
        result.push(arrayvar.splice(0, Math.ceil(arrayvar.length / i)));
    }
    return result;
  }

  //splitToChunks(Array(30).fill({value: "", color: ""}), 6)
  const [tiles, setTiles] = useState();
  const [solved, setSolved] = useState(false);
  const [progress, setProgress] = useState();
  const [displayedAnswer, setDisplayedAnswer] = useState();
  const [answer, setAnswer] = useState();
  const [guess, setGuess] = useState();      
  const [score, setScore] = useState();                                        // Value (Gray, Yellow, Green)
  const [report, setReport] = useState([{name: 'row-1', value: []},{name: 'row-2', value: []},{name: 'row-3', value: []},{name: 'row-4', value: []},{name: 'row-5', value: []}]);
  const [listOfAnswers, setListOfAnswers] = useState();
  const [listOfGuesses, setListOfGuesses] = useState();
  const [leaderboard, setLeaderboard] = useState();
  const [steps, setSteps] = useState(1);
  const [keyboard, setKeyboard] = useState([]);

  const fetchLeaderboard = () => {
    db.collection("words").orderBy("score", "desc").get().then((querySnapshot) => {
      var tempWords = [];
      querySnapshot.forEach((doc) => {
        tempWords.push(doc.data());
      });
      setLeaderboard(tempWords);
    });
  }

  useEffect(() => {    
    fetch(rawAllowed)
    .then(r => r.text())
    .then(text => {
      setListOfGuesses(text.replaceAll('"', '').split(','));
    })
  }, []);

  useEffect(() => {    
    fetchLeaderboard();
  }, [solved]);

  useEffect(() => {   
    const sleep = (milliseconds) => {
      return new Promise(resolve => setTimeout(resolve, milliseconds))
    }
    
    const loadGuesses = async () => {
      fetchLeaderboard();

      var answerArr = [];
      for (let i = 0; i < keyboard.length; i++)
      {
        answerArr.push({ value: keyboard.join('').split('')[i], color: "green", check: false });
      } 

      console.log('SET THE ANSWER')
      console.log(answerArr)

      setDisplayedAnswer(answer);
      setAnswer(answerArr);

      for (const guess of listOfGuesses) {
        setProgress(((listOfGuesses.indexOf(guess) / listOfGuesses.length) * 100).toFixed(2));
        var guessArr = [];
        for(let i = 0; i < guess.length; i++)
        {
          guessArr.push({ value: guess.split('')[i], color: "", check: false });
        } 
        setGuess(guessArr);
        await sleep();
      }
      
      for (let i = 0; i < report.length; i++) {
        report[i].value = report[i].value.reduce((accumulator, value) => {
          return {...accumulator, [value] : (accumulator[value] || 0) + 1};
        }, {})
        
        for (let x = 0; x < 3; x++) {
          if(report[i].value[x] !== undefined) {
            report[i].value[x] = Math.round((report[i].value[x] / listOfGuesses.length) * 100);
          } else {
            report[i].value[x] = 0;
          }
        }
      }

      let tempScore = 0;
      for (let i = 0; i < report.length; i++) {
        for (let x = 0; x < 3; x++) {
          if (x == 1) {
            tempScore += (report[i].value[x] / 100) * 2;
          } else if(x == 2) {
            tempScore += (report[i].value[x] / 100) * 2;
          }
        }
      }

      var wordsRef = db.collection("words");
      wordsRef.doc(keyboard.join()).set({
        word: keyboard.join(''), score: tempScore.toFixed(2)});

      console.log(report);
      setScore(tempScore.toFixed(2));
      setSolved(true);
    }   
    if(steps === 3) {
      loadGuesses();
    }
  }, [listOfAnswers, listOfGuesses, steps]);

  useEffect(() => {
    if(guess != undefined)
    {
      //Green pass
      for (let i = 0; i < guess.length; i++) {
        if (answer[i].value === guess[i].value) {
          guess[i] = {...guess[i], color: 'green', check: true}
        } else {
          guess[i] = {...guess[i], color: 'gray', check: false}
        }
      }
    
      //Yellow pass
      for (let i = 0; i < guess.length; i++) {
        if(answer.find(element => (element.value === guess[i].value) && guess[i].check == false)) {
          guess[i] = {...guess[i], color: 'yellow', check: true}
        } 
      }
      
      for (let i = 0; i < guess.length; i++) {
        if (guess[i].color == 'green') {
          report[i].value.push(2);
        } else if (guess[i].color == 'yellow' ) {
          report[i].value.push(1);
        } else {
          report[i].value.push(0);
        }
      }

      setTiles(splitToChunks(Array.prototype.concat(guess, Array(30 - guess.length).fill({value: "", color: ""})), 6));
    }
  }, [guess]);

  const loadNextStep = () => {
    setSteps(steps + 1);
  }

  const updateInputsBasedOnKeys = (input) => {
    if (input === 'CLEAR') {
      setKeyboard([]);
    } else if (input === 'ENTER' && keyboard.length === 5) {
      if (listOfGuesses.includes(keyboard.join(''))) {
        setSteps(steps + 1);
        
      } else {
        alert('Please try using a valid word');
        setKeyboard([]);
      }
    } else if (input !== 'ENTER' && keyboard.join('').split('').length < 5){
      setKeyboard([...keyboard.join('').split(''), input, ...Array(4 - (keyboard.filter(key => (key != '')).length)).fill('')]);
    }
  }

  return (
    <main className="contianer">
      {steps && steps === 1 && 
        <div className="tiles-container" style={{gap: '15px'}} key={steps}>
          <div className="row">
            {['W', 'E', 'L', 'C', 'O', 'M', 'E'].map((item, index) => (
              <div className={`tile green`} key={index}>{item}</div>
            ))}
          </div>
          <div className="row">
            {['T', 'O'].map((item, index) => (
              <div className={`tile gray`} key={index}>{item}</div>
            ))}
          </div>
          <div className="row">
            {['W', 'O', 'R', 'D', 'L', 'E'].map((item, index) => (
              <div className={`tile yellow`} key={index}>{item}</div>
            ))}
          </div>
          <br></br>
          <div className="row">
            {['V', 'E','R', 'S', 'I', 'O', 'N','-','2'].map((item, index) => (
              <div className={`tile gray`} key={index}>{item}</div>
            ))}
          </div>
          <div className="row">
            {['CLICK HERE TO START'].map((item, index) => (
              <button className={`tile`} key={index} style={{width: 'fit-content', padding: '0 125px', margin: '40px 0'}} onClick={()=> loadNextStep()}>{item}</button>
            ))}
          </div>
        </div> || steps === 2 &&
        <>
          <div className="tiles-container" style={{gap: '15px'}} key={steps}>
            <div className="row">
              {(keyboard && keyboard.length > 0) ? 
                keyboard.map((item, index) => (
                <div className={`tile`} key={index}>{item}</div>
                )) : 
                ['', '', '', '', ''].map((item, index) => (
                  <div className={`tile`} key={index}>{item}</div>
                ))
              }
            </div>

            <br></br>
            <br></br>
            <br></br>

            <div className="row">
              {['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'].map((item, index) => (
                <div className={`tile keyboard`} key={index} style={{ minWidth:'32px', width: 'fit-content', padding: '5px 15px', backgroundColor:'#3a3a3c' }} onClick={()=> updateInputsBasedOnKeys(item)}>{item}</div>
              ))}
            </div>
            <div className="row">
              {['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'].map((item, index) => (
                <div className={`tile keyboard`} key={index} style={{ minWidth:'32px', width: 'fit-content', padding: '5px 15px', backgroundColor:'#3a3a3c' }} onClick={()=> updateInputsBasedOnKeys(item)}>{item}</div>
              ))}
            </div>
            <div className="row">
              {['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'CLEAR'].map((item, index) => (
                <div className={`tile keyboard`} key={index} style={{ width: 'fit-content', padding: '5px 15px', backgroundColor:'#3a3a3c' }} onClick={()=> updateInputsBasedOnKeys(item)}>{item}</div>
              ))}
            </div>
          </div>
        </> || steps === 3 && 
        <>
          <div className="tiles-container">
            <h2 className="progress">{solved ? 100 : progress} / 100</h2>
            <div className="answer-title" style={{textAlign: "center"}}>{displayedAnswer}</div>
            {tiles && tiles.map((item, index) => (
              <div className="row" key={index}>
                {item.map((item, index) => (
                  <div className={`tile ${item.color}`} key={index}>{item.value}</div>
                ))}
              </div>
            ))}
          </div>
          <div className="results">
            <div className="tiles-container">
            <h2 className="progress">{solved ? score : 'loading...'}</h2>
            <div className="answer-title">% of Wordle solutions</div>
              <div className="reports-outer-container">
                <div className="chart-line">
                  <h2>100%</h2>
                  <h2>50%</h2>
                  <h2>0%</h2>
                </div>
                <div className="temp">
                  <div className="reports-container">
                    {solved && report.map(item => (
                        <div className="data-column" key={item.name} style={{ background: `linear-gradient(to top, rgb(58, 58, 60) 0px, rgb(58, 58, 60) ${item.value[0]}%, rgb(181, 159, 59) 0%, rgb(181, 159, 59) ${item.value[0] + item.value[1]}%, rgb(83, 141, 78) 0%, rgb(83, 141, 78) 100%)`}}></div>
                    ))}
                  </div>
                  <div className="row">
                    {answer && answer.map((item, index) => (
                      <div className={`tile`} key={index}>{item.value}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="leaderboard">
            <h1>LEADER-WORD</h1>
            <h5># ONLY THE BEST WORDS MAKE IT HERE #</h5>
            <li className="header-bar"><span className="rating">rank</span><span className="header-score">score</span><span className="header-word">word</span></li>
            <ul className="list-of-records">
              {leaderboard && leaderboard.map((item, index) => (
                <li key={index} className={`${index == 0 && 'first-rank' || index == 1 && 'second-rank' || 'regular-rank'}`}><span className={`rank ${index == 0 && 'first-rank' || index == 1 && 'second-rank' }`}>{index + 1}</span><span className="score">{item.score}</span><span className="word">{item.word}</span></li>          
              ))}
            </ul> 
          </div>
        </>
      }
    </main>
  );
}
 
export default App;
