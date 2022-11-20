const express = require ('express')
const app = express()
const hbs = require('express-handlebars')
const bodyParser = require('body-parser')

// Importar model Cliente
const Cliente = require('./models/Cliente')
const Servico = require('./models/Servico')

// Configuração do Handlebars
app.engine('hbs', hbs.engine({
    extname: 'hbs', 
    defaultLayout: 'main'
}))

app.set('view engine', 'hbs')

app.use(express.static('assets'))

app.use(bodyParser.urlencoded({extended:false}))


// Rotas 
app.get('/', (req, res) => {
    res.render('index')
})

app.get('/servicos', (req, res) => {
    Servico.findAll()
    .then((servicos) => {
        res.render('servicos', { 
            servicos: servicos.map((servicos) => servicos.toJSON() )
         })
    })
    .catch((err) => console.log(err))
})

app.get('/novoservico', (req, res) => {
    res.render('novoServico')
})

app.post('/cadServico', (req, res) => {
    //Valores vindos do formulário
    let nome = req.body.nome
    let valor = req.body.valor

    let erros = []

    /* Remover espaços em branco */
    nome = nome.trim()

    /* Limpar caracteres especiais */
    nome = nome.replace(/[^A-zÀ-ú\s]/gi, '')
    nome = nome.trim()

    /* Verificar se está vazio ou não definido */
    if (nome == '' || typeof nome == undefined || nome == null) {
        erros.push({mensagem: "Campo nome não pode ser vazio!"})
    }

    /* Verificar se campo nome é válido (apenas letras)*/
    if(!/^[A-Za-záàâãéèêíïóôõöúçñÁÀÂÃÉÈÍÏÓÔÕÖÚÇÑ\s]+$/.test(nome)) {
        erros.push({mensagem:"Nome Inválido!"})
   }
   
   /* Verificar se está vazio ou não definido */
    if (valor == '' || typeof valor == undefined || valor == null) {
        erros.push({mensagem: "Campo valor não pode ser vazio!"})
    }

    //Sucesso (Nenhum Erro) - Salvar no BD
    Servico.create({
        nome: nome,
        valor: valor
    }).then(function() {
        console.log('Cadastrado com sucesso!') 
        return res.redirect('/servicos')
    }).catch(function(err) {
        console.log(`Ops, houve um erro: ${err}`)
    })
})




//Inicialização do Servidor
app.listen(3000, () => {
    console.log('Aplicação rodando na porta 3000!')
})