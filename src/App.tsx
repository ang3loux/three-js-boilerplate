import React, { FunctionComponent } from 'react';
// import Canvas from './ThreeExample';
// import Canvas from './FiguresExample';
import Canvas from './DonutsRainExample';

const App: FunctionComponent<{}> = () => {
  return (
    <div className="h-screen w-screen flex justify-center items-center">
      <Canvas />
    </div>
  );
};

export default App;
