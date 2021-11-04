import { format } from "date-fns";
import { useState } from "react";
import imgProfile from "../../assets/profile.png";
import { api } from "../../services/api";
import { getUser } from "../../services/security";
import { CardComent, CardPost } from "./styles";

function Post({ data }) {
  let signedUser = getUser();

  console.log(data);

  const [showComents, setShowComents] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newComment, setNewComment] = useState("");

  const toggleComents = () => setShowComents(!showComents);

  const handleComment = async (id, comment) => {
    try {
      setIsLoading(true);
      const response = await api.post(`/questions/${id}/answers`, {
        description: comment,
      });

      if (response.status >= 200 && response.status <= 299) {
        /**
         * gostaria tanto de um endpoint que retornase o post por ID.....
         * ou o retorno fosse igual Answers
         */
        const { data: d } = response;

        console.log(d);

        const comment = {
          id: d.id,
          Student: {
            id: signedUser.id,
            name: signedUser.name,
            image: signedUser.image,
          },
          description: d.description,
          created_at: d.createdAt,
        };

        data.Answers.push(comment);

        setNewComment("");
        setIsLoading(false);
        toggleComents();
      }
    } catch (error) {
      setIsLoading(false);
      alert(error);
    }
  };

  const handleNewComment = (event) => setNewComment(event.target.value);

  return (
    <CardPost>
      <header>
        <img
          src={data.Student.image || imgProfile}
          width="60px"
          height="60px"
        />
        <div>
          <p>
            por{" "}
            {signedUser?.studentId === data?.Student?.id
              ? "você"
              : data?.Student?.name}
          </p>
          <span>
            em {format(new Date(data?.created_at), "dd/MM/yyyy 'às' HH:mm")}
          </span>
        </div>
      </header>
      <main>
        <div>
          <h2>{data.title}</h2>
          <p>{data.description}</p>
        </div>
        {data?.image && <img src={data?.image} alt="imagem do post" />}
        <footer>
          {data.Categories.map((c) => (
            <p>{c.description}</p>
          ))}
        </footer>
      </main>

      {isLoading ? (
        <>
          <span>Carregando...</span>
        </>
      ) : (
        <>
          <footer>
            <h3 onClick={toggleComents}>
              {data.Answers.length === 0
                ? "Seja o primeiro a comentar"
                : `${data.Answers.length} Comentário${
                    data.Answers.length > 1 ? "s" : ""
                  }`}
            </h3>
            {showComents && (
              <>
                {data.Answers?.sort(({ id: first }, { id: second }) =>
                  first > second ? -1 : 1
                ).map((comment) => (
                  <Coment comment={comment} />
                ))}
              </>
            )}
            <div>
              <input
                value={newComment}
                placeholder="Comente este post"
                maxLength={147}
                onChange={handleNewComment}
              />
              {` ${newComment.length}/147 `}
              <button
                style={{
                  cursor: newComment.length < 10 ? "default" : "pointer",
                }}
                title={"Mínimo 10 caracteres"}
                onClick={
                  newComment.length < 10
                    ? () => alert("Minimo 10 Caracteres")
                    : () => handleComment(data.id, newComment)
                }
              >
                Enviar
              </button>
            </div>
          </footer>
        </>
      )}
    </CardPost>
  );
}

function Coment({ comment }) {
  return (
    <CardComent>
      <header>
        <img src={comment?.Student?.image} />
        <div>
          <p>{comment?.Student?.name}</p>
          <span>
            {format(new Date(comment?.created_at), "dd/MM/yyyy 'às' HH:mm")}
          </span>
        </div>
      </header>
      <p>{comment?.description}</p>
    </CardComent>
  );
}

export default Post;
