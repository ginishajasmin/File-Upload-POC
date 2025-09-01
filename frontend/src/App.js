import './App.css';
import MulterUpload from './components/multerFileUpload';
import S3Upload from './components/s3FileUpload';

function App() {
  return (
    <div className="App">
      <S3Upload/>
      <MulterUpload/>
    </div>
  );
}

export default App;
