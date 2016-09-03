module.exports = [{
  name: 'Hendo',
  n: 250,
  c: 0.7,
  broader: 'normal',
  bias: {
    db: 20,
    freq: 0.5,
    seq: 0,
    turn: 0,
    user: 0.5
  },
  sim: {
    freq: 0,
    seq: 0.5,
    turn: 0,
    user: 0.5,
    boltzmann: 0.25
  },
  fpu: {
    coefficient: 1.7,
    freq: 0.5,
    seq: 0,
    turn: 0,
    user: 0.5
  },
  amv: {
    simLength: -1,
    freq: 0,
    seq: 0,
    turn: 0,
    user: 0
  }
},
{
  name: 'normal',
  n: 250,
  c: 0.7,
  broader: 'normal',
  bias: {
    db: 0,
    freq: 0,
    seq: 0,
    turn: 0,
    user: 0
  },
  sim: {
    freq: 0,
    seq: 0,
    turn: 0,
    user: 0,
    boltzmann: 1
  },
  fpu: {
    coefficient: 1,
    freq: 0,
    seq: 0,
    turn: 0,
    user: 0
  },
  amv: {
    simLength: -1,
    freq: 0,
    seq: 0,
    turn: 0,
    user: 0
  }
}]