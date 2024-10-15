// src/App.js
import React from 'react';
import Body from './components/Body';
import Login from './components/Login';
import Home from './components/Home';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider} from "react-redux";
import appStore from './utils/appStore';
import MealDetails from './components/MealDetails';
import Chat from './components/Chat';
import Signup from './components/Signup';
import LikedMeals from "./components/LikedMeals";
function App() {
  return (
    <>
    <Provider store={appStore}>
    <BrowserRouter basename='/'>
    <Routes>
      <Route path="/" element={<Body/>} >
      <Route path="/" element={<Home/>} />
      <Route path="/meals/:mealId" element={<MealDetails/>} />
      <Route path="/liked" element={<LikedMeals/>} />
      <Route path="/chat" element={<Chat/>} />
      <Route path="/signup" element={<Signup/>} />
      <Route path="/login" element={<Login/>} />
      </Route>
    </Routes>
   
    </BrowserRouter>
    </Provider>
    </>
  );
}

export default App;
