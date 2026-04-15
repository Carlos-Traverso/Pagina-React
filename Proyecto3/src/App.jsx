import { useState } from "react";

function App() {
  const nombre = "Carlos";
  const edad = 25;

  return (
    <div>
      <h1> Hola soy {nombre} </h1>
      <p>Tengo {edad} años.</p>
    </div>
  
  );
}

export default App;