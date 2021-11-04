import { useEffect, useState } from "react";
import { GlobalStyles } from "./GlobalStyles";
import Router from "./routes";
import { api } from "./services/api";
import { signIn } from "./services/security";

function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  //executar o login hard code
  const doSignIn = async () => {
    try {
      const response = await api.post("/sessions", {
        email: "rafanleme@gmail.com",
        password: "123456",
      });
      signIn(response.data);
    } catch (error) {
      console.error(error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    doSignIn();
  }, []);

  return (
    <>
      <GlobalStyles />
      {loading ? "Carregando..." : error ? "Ops, algo deu errado" : <Router />}
    </>
  );
}

export default App;
