const express = require ('express')
const app = express()

//Importar model Cliente
const Cliente = require('./models/Cliente')

app.get('/clientes', (req, res) => {
    Cliente.findAll().then((data) => {
        if (data.length > 0) {
            res.send(data)
        } else {
            res.send("Sem clientes cadastrados!")
        }
        
    }).catch((err) => {
        console.log(`Houve um problema: ${err}`)
    })
})




//Inicialização do Servidor
app.listen(3000, () => {
    console.log('Aplicação rodando na porta 3000!')
})