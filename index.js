const express = require ('express')
const app = express()
const hbs = require('express-handlebars')
const bodyParser = require('body-parser')

// Importar model Cliente
const Cliente = require('./models/Cliente')

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
    res.render('servicos')
})




//Inicialização do Servidor
app.listen(3000, () => {
    console.log('Aplicação rodando na porta 3000!')
})