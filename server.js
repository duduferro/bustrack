import express from "express";
import cors from "cors";
import fs from "node:fs";

const PORT = 3333;
const url_database = "./database/onibus.json";
const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());

app.post("/motoristas", (request, response) => {
  const { nome, data_nascimento, carteira_habilitacao } = request.body;

  if (!nome || typeof nome !== "string" || nome.trim() === "") {
    response
      .status(400)
      .json({ mensagem: "O campo 'nome' é obrigatório e deve ser um texto" });
    return;
  }

  if (
    !carteira_habilitacao ||
    typeof carteira_habilitacao !== "string" ||
    carteira_habilitacao.trim() === ""
  ) {
    response
      .status(400)
      .json({
        mensagem:
          "O campo 'carteira_habilitacao' é obrigatório e deve ser um texto",
      });
    return;
  }

  if (
    !data_nascimento ||
    typeof data_nascimento !== "string" ||
    data_nascimento.trim() === ""
  ) {
    response
      .status(400)
      .json({
        mensagem: "O campo 'data_nascimento' é obrigatório e deve ser um texto",
      });
    return;
  }

  fs.readFile(url_database, "utf-8", (err, data) => {
    if (err) {
      response.status(500).json({ mensagem: "Erro ao ler arquivo" });
      return;
    }

    const database = JSON.parse(data || '{"onibus": [], "motoristas": []}');
    const novoMotorista = {
      id: Date.now().toString(),
      nome,
      data_nascimento,
      carteira_habilitacao,
    };

    database.motoristas.push(novoMotorista);

    fs.writeFile(
      url_database,
      JSON.stringify(database, null, 2),
      (err) => {
        if (err) {
          response.status(500).json({ mensagem: "Erro ao cadastrar motorista" });
          return;
        }
        response
          .status(201)
          .json({ mensagem: "Motorista cadastrado com sucesso", data: novoMotorista });
      }
    );
  });
});

app.post("/onibus", (request, response) => {
  const { placa, modelo, ano_fabricacao, capacidade } = request.body;

  if (!placa || typeof placa !== "string" || placa.trim() === "") {
    response
      .status(400)
      .json({ mensagem: "O campo 'placa' é obrigatório e deve ser um texto" });
    return;
  }

  if (!modelo || typeof modelo !== "string" || modelo.trim() === "") {
    response
      .status(400)
      .json({ mensagem: "O campo 'modelo' é obrigatório e deve ser um texto" });
    return;
  }

  if (
    !ano_fabricacao ||
    typeof ano_fabricacao !== "string" ||
    ano_fabricacao.trim() === ""
  ) {
    response.status(400).json({
      mensagem: "O campo 'ano_fabricacao' é obrigatório e deve ser um texto",
    });
    return;
  }

  if (!capacidade || typeof capacidade !== "string" || capacidade.trim() === "") {
    response.status(400).json({
      mensagem: "O campo 'capacidade' é obrigatório e deve ser um texto",
    });
    return;
  }

  fs.readFile(url_database, "utf-8", (err, data) => {
    if (err) {
      response.status(500).json({ mensagem: "Erro ao ler arquivo" });
      return;
    }

    const database = JSON.parse(data || '{"onibus": [], "motoristas": []}');
    const novoOnibus = {
      id: Date.now().toString(),
      placa,
      modelo,
      ano_fabricacao,
      capacidade,
    };

    database.onibus.push(novoOnibus);

    fs.writeFile(
      url_database,
      JSON.stringify(database, null, 2),
      (err) => {
        if (err) {
          response.status(500).json({ mensagem: "Erro ao cadastrar ônibus" });
          return;
        }
        response
          .status(201)
          .json({ mensagem: "Ônibus cadastrado com sucesso", data: novoOnibus });
      }
    );
  });
});

app.get("/motoristas", (request, response) => {
  fs.readFile(url_database, "utf-8", (err, data) => {
    if (err) {
      response.status(500).json({ mensagem: "Erro ao ler arquivo" });
      return;
    }

    const database = JSON.parse(data || '{"onibus": [], "motoristas": []}');
    response.status(200).json(database.motoristas);
  });
});

app.get("/onibus", (request, response) => {
  fs.readFile(url_database, "utf-8", (err, data) => {
    if (err) {
      response.status(500).json({ mensagem: "Erro ao ler arquivo" });
      return;
    }

    const database = JSON.parse(data || '{"onibus": [], "motoristas": []}');
    response.status(200).json(database.onibus);
  });
});

app.put("/motoristas/:id/onibus", (request, response) => {
  const { id } = request.params;
  const { onibusId } = request.body;

  if (!onibusId || typeof onibusId !== "string") {
    response
      .status(400)
      .json({
        mensagem: "O campo 'onibusId' é obrigatório e deve ser um texto válido",
      });
    return;
  }

  fs.readFile(url_database, "utf-8", (err, data) => {
    if (err) {
      response
        .status(500)
        .json({ mensagem: "Erro ao ler o arquivo de banco de dados" });
      return;
    }

    const database = JSON.parse(data || '{"onibus": [], "motoristas": []}');
    const motorista = database.motoristas.find(
      (motorista) => motorista.id === id
    );
    const onibus = database.onibus.find((onibus) => onibus.id === onibusId);

    if (!motorista) {
      response
        .status(404)
        .json({ mensagem: `Motorista com ID '${id}' não encontrado` });
      return;
    }

    if (!onibus) {
      response
        .status(404)
        .json({ mensagem: `Ônibus com ID '${onibusId}' não encontrado` });
      return;
    }

    motorista.onibus = onibus;

    fs.writeFile(
      url_database,
      JSON.stringify(database, null, 2),
      (err) => {
        if (err) {
          response
            .status(500)
            .json({ mensagem: "Erro ao salvar as alterações" });
          return;
        }
        response.status(200).json({
          mensagem: "Ônibus atribuído ao motorista",
          dados: motorista,
        });
      }
    );
  });
});

app.delete("/motoristas/:id/onibus", (request, response) => {
  const { id } = request.params;

  fs.readFile(url_database, "utf-8", (err, data) => {
    if (err) {
      response
        .status(500)
        .json({ mensagem: "Erro ao ler o arquivo" });
      return;
    }

    const database = JSON.parse(data || '{"onibus": [], "motoristas": []}');
    const motorista = database.motoristas.find(
      (motorista) => motorista.id === id
    );

    if (!motorista) {
      response
        .status(404)
        .json({ mensagem: `Motorista com ID '${id}' não foi encontrado` });
      return;
    }

    if (!motorista.onibus) {
      response
        .status(400)
        .json({
          mensagem: "Este motorista já não possui um ônibus",
        });
      return;
    }

    motorista.onibus = null;

    fs.writeFile(
      url_database,
      JSON.stringify(database, null, 2),
      (err) => {
        if (err) {
          response
            .status(500)
            .json({ mensagem: "Erro ao salvar as alterações" });
          return;
        }
        response.status(200).json({
          mensagem: "Ônibus removido do motorista com sucesso",
          dados: motorista,
        });
      }
    );
  });
});

app.listen(PORT, () => {
  console.log(`Servidor iniciado em: http://localhost:${PORT}`);
});