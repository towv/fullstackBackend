const mongoose = require('mongoose')

const url = 'mongodb://erittäin:salainen@ds229418.mlab.com:29418/nodeful'

mongoose.connect(url)

const Person = mongoose.model('Person', {
    name: String,
    number: String
})

if (process.argv[2]) {
    const name = process.argv[2]

    const number = process.argv[3]

    const person = new Person({
        name: name,
        number: number
    })

    person
        .save()
        .then(response => {
            console.log('lisätään henkilö ' + name + ' numero ' + number + ' luetteloon')
            mongoose.connection.close()
        })
} else {
    console.log('puhelinluettelo:')

    Person
        .find({})
        .then(result => {
            result.forEach(person => {
                console.log(person.name + ' ' + person.number)
            })
            mongoose.connection.close()
        })
}