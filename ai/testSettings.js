module.exports = [{
  name: 'FPU freq = 1',
  n: 250,
  c: 0.7,
  bias: {
    db: 20,
    freq: 0,
    seq: 0,
    turn: 1,
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
},
{
  name: 'normal',
  n: 250,
  c: 0.7,
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