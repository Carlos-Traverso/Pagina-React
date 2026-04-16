import { AppProvider } from './context/AppContext';
import { AppRouter } from './router/AppRouter';
import './index.css';

function App() {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
}

export default App;