import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Typography,
  Box,
  Container,
  TextField,
  Button,
  Rating,
} from "@mui/material";
import { Upload } from "@mui/icons-material";

type Comment = {
  id: number;
  username: string;
  text: string;
  moment_id: number;
  created_at: string;
  updated_at: string;
  rate: number;
};

type Moment = {
  id: number;
  title: string;
  description: string;
  image: string | null;
  created_at: string;
  updated_at: string;
  comments: Comment[];
};

const App = () => {
  const [moments, setMoments] = useState<Moment[]>([]);
  const [newMoment, setNewMoment] = useState<Moment>({
    id: 0,
    title: "",
    description: "",
    image: null,
    created_at: "",
    updated_at: "",
    comments: [],
  });
  const [newComment, setNewComment] = useState<Comment>({
    id: 0,
    username: "",
    text: "",
    moment_id: 0,
    created_at: "",
    updated_at: "",
    rate: 0,
  });

  useEffect(() => {
    fetchMoments();
  }, []);

  const fetchMoments = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:3333/api/moments");
      setMoments(response.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewMoment((prevMoment) => ({
      ...prevMoment,
      [event.target.name]: event.target.value,
    }));
  };

  const handleCommentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewComment((prevComment) => ({
      ...prevComment,
      [event.target.name]: event.target.value,
    }));
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      const reader = new FileReader();

      reader.onload = (e) => {
        setNewMoment((prevMoment) => ({
          ...prevMoment,
          image: e.target?.result as string,
        }));
      };

      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const { id, ...newMomentData } = newMoment;

      if (id === 0) {
        const response = await axios.post(
          "http://127.0.0.1:3333/api/moments",
          newMomentData
        );
        setMoments((prevMoments) => [...prevMoments, response.data]);
      } else {
        const response = await axios.put(
          `http://127.0.0.1:3333/api/moments/${id}`,
          newMomentData
        );
        setMoments((prevMoments) => {
          const updatedMoments = [...prevMoments];
          const index = updatedMoments.findIndex((moment) => moment.id === id);
          if (index !== -1) {
            updatedMoments[index] = response.data;
          }
          return updatedMoments;
        });
      }

      setNewMoment({
        id: 0,
        title: "",
        description: "",
        image: null,
        created_at: "",
        updated_at: "",
        comments: [],
      });

      // Fetch the updated moments after adding/updating
      fetchMoments();
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (moment: Moment) => {
    setNewMoment(moment);
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`http://127.0.0.1:3333/api/moments/${id}`);
      setMoments((prevMoments) =>
        prevMoments.filter((moment) => moment.id !== id)
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleCommentSubmit = async (
    event: React.FormEvent,
    momentId: number
  ) => {
    event.preventDefault();

    try {
      const { id, ...newCommentData } = newComment;
      newCommentData.moment_id = momentId;

      await axios.post(
        `http://127.0.0.1:3333/api/moments/${momentId}/comments`,
        newCommentData
      );

      setNewComment({
        id: 0,
        username: "",
        text: "",
        moment_id: 0,
        created_at: "",
        updated_at: "",
        rate: 0,
      });

      // Fetch the updated moments after adding the comment
      fetchMoments();
    } catch (error) {
      console.error(error);
    }
  };

  const getRateLabel = (rate: number) => {
    switch (rate) {
      case 0:
        return "Péssimo";
      case 1:
        return "Não é bom";
      case 2:
        return "Ruim";
      case 3:
        return "Bom";
      case 4:
        return "Muito bom";
      case 5:
        return "Excelente";
      default:
        return "";
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="gray.100"
    >
      <Container maxWidth="md">
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Adicionar Moments
        </Typography>
        <form onSubmit={handleSubmit} style={{ marginTop: "2rem" }}>
          <TextField
            name="title"
            label="Titulo do Moment"
            variant="outlined"
            margin="normal"
            fullWidth
            value={newMoment.title}
            onChange={handleInputChange}
          />
          <TextField
            name="description"
            label="Descrição do Moment"
            variant="outlined"
            margin="normal"
            fullWidth
            multiline
            rows={4}
            value={newMoment.description}
            onChange={handleInputChange}
          />
          <Box sx={{ mt: "1rem" }}>
            <input
              type="file"
              accept="image/*"
              id="upload-image"
              onChange={handleImageChange}
              style={{ display: "none" }}
            />
            <label htmlFor="upload-image">
              <Button
                variant="outlined"
                component="span"
                color="secondary"
                style={{ marginRight: "1rem" }}
                endIcon={<Upload />}
              >
                Adicionar Imagem
              </Button>
            </label>
          </Box>
          <Button
            type="submit"
            variant="contained"
            color="success"
            style={{ marginTop: "1rem" }}
          >
            {newMoment.id === 0 ? "Adicionar Moment" : "Atualizar Moment"}
          </Button>
        </form>

        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Moments
        </Typography>
        {moments.map((moment) => (
          <Box key={moment.id} border={1} p={4} mb={4}>
            <Typography variant="h6" component="h2" gutterBottom>
              {moment.title}
            </Typography>
            <Typography variant="body1" gutterBottom>
              {moment.description}
            </Typography>
            {moment.image && <img src={moment.image} alt="Moment Image" />}
            <Typography variant="subtitle1" component="h3" mt={4} gutterBottom>
              Comentários:
            </Typography>
            {moment.comments?.map((comment) => (
              <Box key={comment.id} border={1} p={2} mb={2}>
                <Typography variant="body2" component="p">
                  <span style={{ fontWeight: "bold" }}>
                    {comment.username}:{" "}
                  </span>
                  {comment.text}
                </Typography>
                <Typography variant="body2" component="p">
                  Avaliação: {getRateLabel(comment.rate)}
                </Typography>
              </Box>
            ))}
            <form onSubmit={(event) => handleCommentSubmit(event, moment.id)}>
              <TextField
                name="username"
                label="Usuário"
                variant="outlined"
                margin="normal"
                fullWidth
                value={newComment.username}
                onChange={handleCommentChange}
              />
              <TextField
                name="text"
                label="Comentário"
                variant="outlined"
                margin="normal"
                fullWidth
                multiline
                rows={4}
                value={newComment.text}
                onChange={handleCommentChange}
              />
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography variant="body1" component="h4" gutterBottom>
                  Avaliação:
                </Typography>
                <Rating
                  name="rate"
                  value={newComment.rate}
                  onChange={(_, value) => {
                    setNewComment((prevComment) => ({
                      ...prevComment,
                      rate: value || 0,
                    }));
                  }}
                  style={{ marginLeft: "1rem" }}
                />
              </Box>
              <Button type="submit" variant="contained" color="success">
                Adicionar Comentário
              </Button>
            </form>
            <Box display="flex" justifyContent="end" mt={2}>
              <Button
                sx={{ mr: 2 }}
                color="warning"
                variant="contained"
                onClick={() => handleEdit(moment)}
              >
                Editar
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={() => handleDelete(moment.id)}
              >
                Deletar
              </Button>
            </Box>
          </Box>
        ))}
      </Container>
    </Box>
  );
};

export default App;
