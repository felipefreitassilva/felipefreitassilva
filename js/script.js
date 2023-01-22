function calcularIdade() {
    const data = new Date()
    const dia = parseInt(data.getDate())
    const mes = parseInt(data.getMonth() + 1)
    const ano = parseInt(data.getFullYear())
    const diaN = 2
    const mesN = 4
    const anoN = 2003
    let minhaIdade = ano - anoN
    if (mes < mesN) {
        minhaIdade--
    } else if (mes == mesN) {
        if (dia < diaN) {
            minhaIdade--
        }
    }
    document.getElementById('idade').innerHTML = minhaIdade

    document.getElementById('xp').innerHTML = ano - 2020
}
calcularIdade()