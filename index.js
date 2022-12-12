const express = require('express')
const bcrypt = require('bcrypt')
//const jwt = require('jsonwebtoken')
const hbs = require('express-handlebars')
const bodyParser = require('body-parser')
const session = require('express-session')

const app = express()

// Importar model Cliente
const Cliente = require('./models/Cliente')
const Usuario = require('./models/Usuario')
const Servico = require('./models/Servico')
const Atendimento = require('./models/Atendimento')
const e = require('express')

// Configuração do Handlebars
app.engine('hbs', hbs.engine({
    extname: 'hbs',
    defaultLayout: 'main'
}))

app.set('view engine', 'hbs')

app.use(express.static('public'))
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: false }))

//Confuguração das Sessions
app.use(session({
    secret: '123blablabla',
    resave: false,
    saveUninitialized: true
}))

/* ROTAS */
app.get('/', (req, res) => {
    res.render('login', { error: false })
})

// Login de Usuário
app.post('/', async (req, res) => {
    const { email, senha } = req.body

    //Array que vai conter os erros
    let erros = []

    /* Verificar se está vazio ou não definido */
    if (email == '' || typeof email == undefined || email == null) {
        erros.push({ mensagem: "Campo email não pode ser vazio!" })
    }

    /* Verificar se está vazio ou não definido */
    if (senha == '' || typeof senha == undefined || senha == null) {
        erros.push({ mensagem: "Campo senha não pode ser vazio!" })
    }

    // Checar se usuário existe
    const user = await Usuario.findByPk(email)

    const userExists = user instanceof Usuario

    if (!userExists) {
        erros.push({ mensagem: "Email Inválido." })
    } else {
        const userData = user.toJSON()
        // Checar se senha combina
        const checkPassword = await bcrypt.compare(senha, userData.senha)

        if (!checkPassword) {
            erros.push({ mensagem: "Senha Inválida." })
        }
    }

    if (erros.length > 0) {
        return res.render('login', { error: true, problemas: erros })
    } else {
        const userData = user.toJSON()
        req.session.userName = userData.nome
        let userName = req.session.userName

        return res.redirect(`/in/${userName}`)
    }

    /*const secret = process.env.SECRET
    const token = jwt.sign(
        {
            id: user.nome
        },
        secret
    )*/


})

// Exibir página de cadastro de usuário
app.get('/novoUsuario', (req, res) => {
    if (req.session.userName) {
        res.render('novoUsuario')
    } else {
        res.render('novoUsuario')
    }

})

// Cadastro de Usuário
app.post('/cadUsuario', async (req, res) => {
    if (req.session.userName) {
        let nome = req.body.nome
        let tel = req.body.telefone
        let email = req.body.email
        let senha = req.body.senha

        //Array que vai conter os erros
        const erros = []

        //Validação dos Campos

        /* Remover espaços em branco */
        nome = nome.trim()
        email = email.trim()
        tel = tel.trim()
        senha = senha.trim()

        /* Limpar caracteres especiais */
        nome = nome.replace(/[^A-zÀ-ú\s]/gi, '')
        nome = nome.trim()

        /* Verificar se está vazio ou não definido */
        if (nome == '' || typeof nome == undefined || nome == null) {
            erros.push({ mensagem: "Campo nome não pode ser vazio!" })
        }

        /* Verificar se campo nome é válido (apenas letras)*/
        if (!/^[A-Za-záàâãéèêíïóôõöúçñÁÀÂÃÉÈÍÏÓÔÕÖÚÇÑ\s]+$/.test(nome)) {
            erros.push({ mensagem: "Nome Inválido!" })
        }

        /* Verificar se está vazio ou não definido */
        if (email == '' || typeof email == undefined || email == null) {
            erros.push({ mensagem: "Campo email não pode ser vazio!" })
        }

        /* Verificar se campo email é válido*/
        if (/^[a-z0-9.]+@[a-z0-9]+\.[a-z]+\.([a-z]+)?$/i.test(email)) {
            erros.push({ mensagem: "Campo email Inválido!" })
        }

        const user = await Usuario.findByPk(email)
        const userExists = user instanceof Usuario

        if (userExists) {
            erros.push({ mensagem: "Por favor, utilize outro email." })
        }

        if (erros.length > 0) {
            return res.redirect('/novoUsuario')
        }

        // Criar senha
        const salt = await bcrypt.genSalt(12)
        const senhaHash = await bcrypt.hash(senha, salt)

        //Sucesso (Nenhum Erro) - Salvar no BD
        await Usuario.create({
            nome: nome,
            telefone: tel,
            email: email.toLowerCase(),
            senha: senhaHash
        }).then(function () {
            console.log('Cadastrado com sucesso!')
            res.redirect('/login')
        }).catch(function (err) {
            console.log(`Ops, houve um erro: ${err}`)
            res.redirect('/novoUsuario')
        })
    } else {
        res.render('login')
    }

})

// Middleware
/*
function checkToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(" ")[1]

    if (!token) {
        return res.status(401).json({msg: "Acesso negado."})
    }

    try {
        const secret = process.env.SECRET

        jwt.verify(token, secret)

        // Finalizou o middleware
        next()

    } catch(error) {
        res.status(400).json({msg: "Token Inválido."})
    }
}*/

// Exibir página inicial do app
app.get('/in/:nome', (req, res) => {
    if (req.session.userName) {
        const nome = req.params.nome
        res.render('index', { nomeUsuario: nome })
    } else {
        res.redirect('/')
    }
})

// Exibir/listar serviços cadastrados
app.get('/servicos', async (req, res) => {
    if (req.session.userName) {
        const nomeUsuario = req.session.userName
        const { count, rows } = await Servico.findAndCountAll()

        await Servico.findAll()
            .then((servicos) => {
                res.render('servicos', {
                    servicos: servicos.map((servicos) => servicos.toJSON()),
                    numServicos: count,
                    nomeUsuario: nomeUsuario
                })
                console.log(nome)
            })
            .catch((err) => console.log(err))
    } else {
        res.redirect('/')
    }

})

app.get('/novoservico', (req, res) => {
    if (req.session.userName) {
        res.render('novoServico')
    } else {
        res.redirect('/')
    }

})


// Cadastrar novo serviço
app.post('/cadServico', async (req, res) => {
    if (req.session.userName) {
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
            erros.push({ mensagem: "Campo nome não pode ser vazio!" })
        }

        /* Verificar se campo nome é válido (apenas letras)*/
        if (!/^[A-Za-záàâãéèêíïóôõöúçñÁÀÂÃÉÈÍÏÓÔÕÖÚÇÑ\s]+$/.test(nome)) {
            erros.push({ mensagem: "Nome Inválido!" })
        }

        /* Verificar se está vazio ou não definido */
        if (valor == '' || typeof valor == undefined || valor == null) {
            erros.push({ mensagem: "Campo valor não pode ser vazio!" })
        }

        //Sucesso (Nenhum Erro) - Salvar no BD
        await Servico.create({
            nome: nome,
            valor: valor
        }).then(function () {
            console.log('Cadastrado com sucesso!')
            return res.redirect(`/servicos`)
        }).catch(function (err) {
            console.log(`Ops, houve um erro: ${err}`)
        })
    } else {
        res.redirect('/')
    }

})

// Exibir serviço a ser editado
app.post('/editarServico', async (req, res) => {
    if (req.session.userName) {
        let idServico = req.body.idServico
        await Servico.findByPk(idServico).then((dados) => {
            console.log(dados)
            return res.render('editarServico', {
                error: false,
                idServico: dados.idServico,
                nome: dados.nome,
                valor: dados.valor,
            })
        }).catch((err) => {
            //console.log(err)
            return res.render(`editarServico`, {
                error: true,
                problema: 'Não é possível editar esse registro!',
            })
        })
    }
})

// Editar serviço
app.post('/updateServico', async (req, res) => {
    if (req.session.userName) {
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
            erros.push({ mensagem: "Campo nome não pode ser vazio!" })
        }

        /* Verificar se campo nome é válido (apenas letras)*/
        if (!/^[A-Za-záàâãéèêíïóôõöúçñÁÀÂÃÉÈÍÏÓÔÕÖÚÇÑ\s]+$/.test(nome)) {
            erros.push({ mensagem: "Nome Inválido!" })
        }

        /* Verificar se está vazio ou não definido */
        if (valor == '' || typeof valor == undefined || valor == null) {
            erros.push({ mensagem: "Campo valor não pode ser vazio!" })
        }

        await Servico.update({
            nome: nome,
            valor: valor
        },
            {
                where: {
                    idServico: req.body.idServico
                }
            }).then((resultado) => {
                console.log(resultado)
                return res.redirect(`/servicos`)
            }).catch((err) => {
                console.log(err)
            })
    } else {
        res.redirect('/')
    }
})

// Deletar serviço
app.post('/deletarServico', async (req, res) => {
    if (req.session.userName) {
        let idServico = req.body.idServico
        await Servico.destroy({
            where: {
                idServico: idServico
            }
        }).then(() => {
            return res.redirect(`/servicos`)
        }).catch((err) => {
            console.log(err)
        })
    } else {
        res.redirect('/')
    }
})

// Exibir/listar clientes cadastrados
app.get('/clientes', async (req, res) => {
    if (req.session.userName) {
        let nomeUsuario = req.session.userName
        const { count, rows } = await Cliente.findAndCountAll()
        let numClientes = count

        await Cliente.findAll()
            .then((cliente) => {
                res.render('clientes', {
                    cliente: cliente.map((clientes) => clientes.toJSON()),
                    numCliente: numClientes,
                    nomeUsuario: nomeUsuario
                })
            })
            .catch((err) => console.log(err))
    } else {
        res.redirect('/')
    }
})

// Exibir página de cadastro de novo cliente
app.get("/novoCliente", (req, res) => {
    if (req.session.userName) {
        res.render("novoCliente")
    } else {
        res.redirect('/')
    }
})

// Cadastro de cliente
app.post('/cadCliente', async (req, res) => {
    if (req.session.userName) {
        //Valores vindos do formulário
        let { nome, email, telefone, data_nasc } = req.body

        let erros = []

        /* Remover espaços em branco */
        nome = nome.trim()

        /* Limpar caracteres especiais */
        nome = nome.replace(/[^A-zÀ-ú\s]/gi, '')
        nome = nome.trim()

        /* Verificar se está vazio ou não definido */
        if (nome == '' || typeof nome == undefined || nome == null) {
            erros.push({ mensagem: "Campo nome não pode ser vazio!" })
        }

        /* Verificar se campo nome é válido (apenas letras)*/
        if (!/^[A-Za-záàâãéèêíïóôõöúçñÁÀÂÃÉÈÍÏÓÔÕÖÚÇÑ\s]+$/.test(nome)) {
            erros.push({ mensagem: "Nome Inválido!" })
        }

        /* Verificar se está vazio ou não definido */
        if (telefone == '' || typeof telefone == undefined || telefone == null) {
            erros.push({ mensagem: "Campo telefone não pode ser vazio!" })
        }

        if (data_nasc == '' || typeof data_nasc == undefined || data_nasc == null) {
            erros.push({ mensagem: "Campo Data Nascimento não pode ser vazio!" })
        }

        if (email == '' || typeof email == undefined || email == null) {
            erros.push({ mensagem: "Campo Email não pode ser vazio!" })
        }

        //Teste Email  
        var re = /\S+@\S+\.\S+/;

        if (re.test(email) == false) {
            erros.push({ mensagem: "Email inválido" })
        }


        //Sucesso (Nenhum Erro) - Salvar no BD
        await Cliente.create({
            nome: nome,
            telefone: telefone,
            email: email,
            data_nasc: data_nasc
        }).then(function () {
            console.log('Cadastrado com sucesso!')
            return res.redirect(`/clientes`)
        }).catch(function (err) {
            console.log(`Ops, houve um erro: ${err}`)
        })
    } else {
        res.redirect('/')
    }
})

// Exibir serviço a ser editado
app.post('/editarCliente', async (req, res) => {
    if (req.session.userName) {
        let idCliente = req.body.idCliente
        await Cliente.findByPk(idCliente).then((dados) => {
            return res.render('editarCliente', {
                error: false,
                idCliente: dados.idCliente,
                nome: dados.nome,
                email: dados.email,
                telefone: dados.telefone,
                data_nasc: dados.data_nasc,
            })
        }).catch((err) => {
            console.log(err)
            return res.render(`editarCliente`, {
                error: true,
                problema: 'Não é possível editar esse registro!',
            })
        })
    } else {
        res.redirect('/')
    }
})

// Editar serviço
app.post('/updateCliente', async (req, res) => {
    if (req.session.userName) {
        //Valores vindos do formulário
        let { idCliente, nome, email, telefone, data_nasc } = req.body

        let erros = []

        /* Remover espaços em branco */
        nome = nome.trim()

        /* Limpar caracteres especiais */
        nome = nome.replace(/[^A-zÀ-ú\s]/gi, '')
        nome = nome.trim()

        /* Verificar se está vazio ou não definido */
        if (nome == '' || typeof nome == undefined || nome == null) {
            erros.push({ mensagem: "Campo nome não pode ser vazio!" })
        }

        /* Verificar se campo nome é válido (apenas letras)*/
        if (!/^[A-Za-záàâãéèêíïóôõöúçñÁÀÂÃÉÈÍÏÓÔÕÖÚÇÑ\s]+$/.test(nome)) {
            erros.push({ mensagem: "Nome Inválido!" })
        }

        /* Verificar se está vazio ou não definido */
        if (telefone == '' || typeof telefone == undefined || telefone == null) {
            erros.push({ mensagem: "Campo Telefone não pode ser vazio!" })
        }

        if (data_nasc == '' || typeof data_nasc == undefined || data_nasc == null) {
            erros.push({ mensagem: "Campo Data Nascimento não pode ser vazio!" })
        }

        if (email == '' || typeof email == undefined || email == null) {
            erros.push({ mensagem: "Campo Email não pode ser vazio!" })
        }

        //Teste Email  
        var re = /\S+@\S+\.\S+/;

        if (re.test(email) == false) {
            erros.push({ mensagem: "Email inválido" })
        }

        await Cliente.update({
            nome: nome,
            email: email,
            telefone: telefone,
            data_nasc: data_nasc
        },
            {
                where: {
                    idCliente: idCliente
                }
            }).then((resultado) => {
                console.log(resultado)
                return res.redirect(`/clientes`)
            }).catch((err) => {
                console.log(err)
            })
    } else {
        res.redirect('/')
    }
})

// Deletar cliente
app.post('/deletarCliente', (req, res) => {
    if (req.session.userName) {
        let idCliente = req.body.idCliente
        Cliente.destroy({
            where: {
                idCliente: idCliente
            }
        }).then(() => {
            return res.redirect(`/clientes`)
        }).catch((err) => {
            console.log(err)
        })
    } else {
        res.redirect('/')
    }
})

// Exibir atendimentos cadastrados

app.get("/atendimento", async (req, res) => {
    if (req.session.userName) {
        await Servico.findAll()
            .then((servicos) => {
                res.render('venda', {
                    servicos: servicos.map((servicos) => servicos.toJSON()),
                    
                   
                })
                console.log(nome)
            })
            .catch((err) => console.log(err))
    } else {
        res.redirect('/')
    }
})








//CADASTRO DE ATENDIMENTO


app.post('/cadAtendimento', (req, res) => {
    //Valores vindos do formulário

   
    let nome = req.body.name_client
    let valor = PrecoValue
    let dataAtendimento = req.body.data_nasc
    let formaPag = FormaPagValue

    let erros = []

    /* Remover espaços em branco */
    nome = nome.trim()

    /* Limpar caracteres especiais */
    nome = nome.replace(/[^A-zÀ-ú\s]/gi, '')
    nome = nome.trim()

    /* Verificar se está vazio ou não definido */
    if (nome == '' || typeof nome == undefined || nome == null) {
        erros.push({ mensagem: "Campo nome não pode ser vazio!" })
    }

    /* Verificar se campo nome é válido (apenas letras)*/
    if (!/^[A-Za-záàâãéèêíïóôõöúçñÁÀÂÃÉÈÍÏÓÔÕÖÚÇÑ\s]+$/.test(nome)) {
        erros.push({ mensagem: "Nome Inválido!" })
    }

    /* Verificar se está vazio ou não definido */
    if (valor == '' || typeof valor == undefined || valor == null) {
        erros.push({ mensagem: "Campo valor não pode ser vazio!" })
    }

    //Sucesso (Nenhum Erro) - Salvar no BD
    Atendimento.create({
        nome: nome,
        valor: valor,
        data_atendimento: dataAtendimento,
        forma_pag: formaPag
    }).then(function () {
        console.log('Cadastrado com sucesso!')
        return res.redirect('/caixa')
    }).catch(function (err) {
        console.log(`Ops, houve um erro: ${err}`)
    })
})
/* FIM POST ATENDIMENTO */

app.get('/caixa', async (req, res) => {
    if (req.session.userName) {
        let nomeUsuario = req.session.userName
        const { count, rows } = await Atendimento.findAndCountAll()
        let numAtendimento = count

        await Atendimento.findAll()
            .then((atendimento) => {
                res.render('caixa', {
                    atendimentos: atendimento.map((atendimentos) => atendimentos.toJSON()),
                    numAtendimento: numAtendimento,
                    nomeUsuario: nomeUsuario
                })
            })
            .catch((err) => console.log(err))
    } else {
        res.redirect('/')
    }
})

// Logout - Encerrar Sessão
app.get('/logout', (req, res) => {
    req.session.destroy(() => console.log("Sessão encerrada!"))
    res.redirect('/')

})

//Inicialização do Servidor
app.listen(3000, () => {
    console.log('Aplicação rodando na porta 3000!')
})