const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors')

const uri = '';

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect()
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
    });

const app = express();
app.use(express.json());
app.use(cors())

const test = client.db('mumbuca_alvorada').collection('cadastros')

app.get('/cadastros', async (req, res) => {
  const cadastros = await test.find().toArray();
  const header = 'nome,cpf,telefone\n';
  const rows = cadastros.map(c => 
    `"${c.nome}","${c.cpf}","${c.telefone}"`
  ).join('\n');
  const csv = header + rows;

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="cadastros.csv"');
  res.send(csv);
});

app.post('/cadastros', async (req, res) => {
    try {
        const { nome, cpf, telefone, email, lojaSelecionada } = req.body;
        if (!nome || !cpf || !telefone || !email || !lojaSelecionada) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
        }
        const result = await test.insertOne({ nome, cpf, telefone, email, lojaSelecionada });
        res.status(201).json({ message: 'Cadastro realizado com sucesso!', id: result.insertedId });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao cadastrar.' });
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

