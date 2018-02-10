const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

app.use(express.static('build'))
app.use(cors())
app.use(bodyParser.json())

morgan.token('data', function (req, res) {
    return JSON.stringify(req.body)
})

app.use(morgan(':method :url :data :status :res[content-length] - :response-time ms'))


const formatPerson = (person) => {
    return {
        name: person.name,
        number: person.number,
        id: person._id
    }
}

app.get('/info', (req, res) => {
    Person
        .find({})
        .then(persons => {
            res.send('<p>puhelinluettelossa on ' + persons.length + ' henkilön tiedot</p>' + '<p>' + new Date() + '</p>')
        })
})

app.get('/api/persons', (req, res) => {
    Person
        .find({}, { __v: 0 })
        .then(persons => {
            res.json(persons.map(Person.format))
        })
        .catch(error => {
            console.log(error)
        })
})

app.get('/api/persons/:id', (req, res) => {
    Person
        .findById(req.params.id)
        .then(person => {
            if (person) {
                res.json(Person.format(person))
            } else {
                res.status(404).end()
            }
        })
        .catch(error => {
            console.log(error)
            res.status(400).send({ error: 'malformatted id' })
        })
})

app.delete('/api/persons/:id', (req, res) => {
    Person
        .findByIdAndRemove(req.params.id)
        .then(result => {
            res.status(204).end()
        })
        .catch(error => {
            res.status(400).send({ error: 'malformatted id' })
        })
})

app.post('/api/persons', (req, res) => {
    const body = req.body

    if (body.name === undefined || body.number === undefined) {
        return res.status(400).json({ error: 'name or number missing' })
    }

    Person
        .find({ name: body.name })
        .then(result => {
            if (result.length > 0) {
                res.status(422).send({ error: 'name must be unique' })
            } else {
                const person = new Person({
                    name: body.name,
                    number: body.number
                })
                person
                    .save()
                    .then(savedNote => {
                        return Person.format(savedNote)
                    })
                    .then(savedAndFormattedPerson => {
                        res.json(savedAndFormattedPerson)
                    })
            }
        })
})

app.put('/api/persons/:id', (req, res) => {
    const body = req.body

    const person = {
        name: body.name,
        number: body.number
    }

    Person
        .findByIdAndUpdate(req.params.id, person, { new: true })
        .then(updatedPerson => {
            res.json(Person.format(updatedPerson))
        })
        .catch(error => {
            console.log(error)
            res.status(400).send({ error: 'malformatted id' })
        })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})