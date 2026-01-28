import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
  
);
// Insert blurred background
const blurLayer = document.createElement('div');
blurLayer.style.position = 'fixed';
blurLayer.style.top = '0';
blurLayer.style.left = '0';
blurLayer.style.width = '100vw';
blurLayer.style.height = '100vh';
blurLayer.style.backgroundImage = "url('https://i.ibb.co/Kc45TPsc/background.jpg')";
blurLayer.style.backgroundSize = 'cover';
blurLayer.style.backgroundRepeat = 'no-repeat';
blurLayer.style.backgroundPosition = 'center';
blurLayer.style.filter = 'blur(6px)';
blurLayer.style.zIndex = '-1';

document.body.prepend(blurLayer);



// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
