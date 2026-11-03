// Dados extraídos das fichas de treino do Prof. Marco Jim Gui Vallin (CREF 125648-G/SP)
// Aluno: Renato Freire

window.DEFAULT_DATA = {
  student: {
    name: "Renato Freire",
    birthDate: "1985-06-25",
    trainer: "Marco Jim Gui Vallin",
    trainerCref: "125648-G/SP",
    trainerEmail: "MarcoJim.Treinador@Gmail.com",
    trainerPhone: "19 99156 8934"
  },
  activeMicroId: "micro-02",
  microcycles: [
    {
      id: "micro-02",
      name: "Micro 02",
      startDate: "2026-11-03",
      age: 41,
      weeklyGoal: 4,
      daysDescription: "4x: Musculação 3x + Cardio 1x",
      cadence: "2020 (2s Concêntrica + 2s Excêntrica)",
      notes: "Fez cirurgia Lig. Patelar, Fascite Plantar, já recuperado. Faz TM e \"Cárdios\". AMPLITUDE: Máxima. CARGAS: Máximas, até falhar.",
      workouts: {
        A: {
          id: "A",
          title: "Treino A",
          subtitle: "Pernas, Costas, Peito, Abdom & Coord",
          type: "strength",
          warmup: "1x 15, carga 50%, para cada grupo muscular.",
          cooldown: "1x30s: Coxa (frente+atrás), Adut, Glút, Peito, Costas, Panturr, Pescç.",
          circuits: [
            {
              id: "Cir 1",
              sets: 3,
              repsTarget: "10 a 15",
              restBetweenSec: 10,
              restAfterSec: 60,
              exercises: [
                {
                  id: "m2-a-1a",
                  key: "LEG PRESS 45: Agachamento",
                  group: "Pernas",
                  name: "LEG PRESS 45: Agachamento",
                  defaultReps: 12,
                  tracksWeight: true
                },
                {
                  id: "m2-a-1b",
                  key: "EM PÉ: Circundução Tornozelo, pés no chão",
                  group: "Coord",
                  name: "EM PÉ: Circundução Tornozelo, pés no chão",
                  defaultReps: 12,
                  tracksWeight: false
                }
              ]
            },
            {
              id: "Cir 2",
              sets: 3,
              repsTarget: "10 a 15",
              restBetweenSec: 10,
              restAfterSec: 60,
              exercises: [
                {
                  id: "m2-a-2a",
                  key: "HALTER: Remada Curvada, Unilateral (Serrote)",
                  group: "Costas",
                  name: "HALTER: Remada Curvada, Unilateral (Serrote)",
                  defaultReps: 12,
                  tracksWeight: true
                },
                {
                  id: "m2-a-2b",
                  key: "CAIXOTE/STEP: Subida Lateral",
                  group: "Pernas",
                  name: "CAIXOTE/STEP: Subida Lateral",
                  defaultReps: 12,
                  tracksWeight: true
                }
              ]
            },
            {
              id: "Cir 3",
              sets: 3,
              repsTarget: "10 a 15",
              restBetweenSec: 10,
              restAfterSec: 60,
              exercises: [
                {
                  id: "m2-a-3a",
                  key: "MÁQ: Cadeira Flexora",
                  group: "Pernas",
                  name: "MÁQ: Cadeira Flexora",
                  defaultReps: 12,
                  tracksWeight: true
                },
                {
                  id: "m2-a-3b",
                  key: "COLCH: Abdom Bicicleta",
                  group: "Abdom",
                  name: "COLCH: Abdom Bicicleta",
                  defaultReps: 15,
                  tracksWeight: false
                }
              ]
            },
            {
              id: "Cir 4",
              sets: 3,
              repsTarget: "10 a 15",
              restBetweenSec: 10,
              restAfterSec: 60,
              exercises: [
                {
                  id: "m2-a-4a",
                  key: "B.DECLINADO+HALTER: Crucifixo",
                  group: "Peito",
                  name: "B.DECLINADO+HALTER: Crucifixo",
                  defaultReps: 12,
                  tracksWeight: true
                },
                {
                  id: "m2-a-4b",
                  key: "YOGA: Postura Sentado ângulo aberto",
                  group: "Coord",
                  name: "YOGA: Postura Sentado ângulo aberto",
                  defaultReps: 10,
                  tracksWeight: false
                }
              ]
            },
            {
              id: "Cir 5",
              sets: 3,
              repsTarget: "10 a 15",
              restBetweenSec: 10,
              restAfterSec: 60,
              exercises: [
                {
                  id: "m2-a-5a",
                  key: "HACK/LEG.MÁQUINA: Panturr, pés paralelos",
                  group: "Pernas",
                  name: "HACK/LEG.MÁQUINA: Panturr, pés paralelos",
                  defaultReps: 15,
                  tracksWeight: true
                },
                {
                  id: "m2-a-5b",
                  key: "Cócoras, Isometria",
                  group: "Coord",
                  name: "Cócoras, Isometria 20s",
                  defaultReps: 20,
                  unitLabel: "seg",
                  tracksWeight: false
                }
              ]
            }
          ]
        },
        B: {
          id: "B",
          title: "Treino B",
          subtitle: "Costas, Pernas, Ombros, Braços & Peito",
          type: "strength",
          warmup: "1x 15, carga 50%, para cada grupo muscular.",
          cooldown: "1x30s: Coxa (frente+atrás), Adut, Glút, Peito, Costas, Panturr, Pescç.",
          circuits: [
            {
              id: "Cir 1",
              sets: 3,
              repsTarget: "10 a 15",
              restBetweenSec: 10,
              restAfterSec: 60,
              exercises: [
                {
                  id: "m2-b-1a",
                  key: "POLIA.ALTA+BARRA: Puxada Aberta, frontal",
                  group: "Costas",
                  name: "POLIA.ALTA+BARRA: Puxada Aberta, frontal",
                  defaultReps: 12,
                  tracksWeight: true
                },
                {
                  id: "m2-b-1b",
                  key: "HALTER: Afundo",
                  group: "Pernas",
                  name: "HALTER: Afundo, Alternado",
                  defaultReps: 12,
                  tracksWeight: true
                }
              ]
            },
            {
              id: "Cir 2",
              sets: 3,
              repsTarget: "10 a 15",
              restBetweenSec: 10,
              restAfterSec: 60,
              exercises: [
                {
                  id: "m2-b-2a",
                  key: "MÁQ: Elevação de Quadril",
                  group: "Pernas",
                  name: "MÁQ: Elevação de Quadril",
                  defaultReps: 12,
                  tracksWeight: true
                },
                {
                  id: "m2-b-2b",
                  key: "HALTER: Desenvolvimento Arnold",
                  group: "Ombros",
                  name: "HALTER: Desenvolvimento Arnold",
                  defaultReps: 12,
                  tracksWeight: true
                }
              ]
            },
            {
              id: "Cir 3",
              sets: 3,
              repsTarget: "10 a 15",
              restBetweenSec: 10,
              restAfterSec: 60,
              exercises: [
                {
                  id: "m2-b-3a",
                  key: "BANCO OBLÍQUO: Extensão Lombar",
                  group: "Pernas",
                  name: "BANCO OBLÍQUO: Extensão Lombar",
                  defaultReps: 12,
                  tracksWeight: true
                },
                {
                  id: "m2-b-3b",
                  key: "HALTER: Bíceps Rosca Direta",
                  group: "Braços",
                  name: "HALTER: Bíceps Rosca Direta",
                  defaultReps: 12,
                  tracksWeight: true
                }
              ]
            },
            {
              id: "Cir 4",
              sets: 3,
              repsTarget: "10 a 15",
              restBetweenSec: 10,
              restAfterSec: 60,
              exercises: [
                {
                  id: "m2-b-4a",
                  key: "BANCO INCLIN+HALTER: Supino",
                  group: "Peito",
                  name: "B.INCLIN+HALTER: Supino",
                  defaultReps: 12,
                  tracksWeight: true
                },
                {
                  id: "m2-b-4b",
                  key: "YOGA: Postura da Lua Crescente",
                  group: "Coord",
                  name: "YOGA: Postura da Lua Crescente",
                  defaultReps: 10,
                  tracksWeight: false
                }
              ]
            },
            {
              id: "Cir 5",
              sets: 3,
              repsTarget: "10 a 15",
              restBetweenSec: 10,
              restAfterSec: 60,
              exercises: [
                {
                  id: "m2-b-5a",
                  key: "COLCH: Abdm Infra, Dragon Flag",
                  group: "Abdom",
                  name: "COLCH: Abdm Infra, Dragon Flag",
                  defaultReps: 12,
                  tracksWeight: false
                },
                {
                  id: "m2-b-5b",
                  key: "HALTER: Tríceps Francês",
                  group: "Braços",
                  name: "HALTER: Tríceps Francês",
                  defaultReps: 12,
                  tracksWeight: true
                }
              ]
            }
          ]
        },
        C: {
          id: "C",
          title: "Treino C",
          subtitle: "Pernas Completo, Costas, Peito & Coord",
          type: "strength",
          warmup: "1x 15, carga 50%, para cada grupo muscular.",
          cooldown: "1x30s: Coxa (frente+atrás), Adut, Glút, Peito, Costas, Panturr, Pescç.",
          circuits: [
            {
              id: "Cir 1",
              sets: 3,
              repsTarget: "10 a 15",
              restBetweenSec: 10,
              restAfterSec: 60,
              exercises: [
                {
                  id: "m2-c-1a",
                  key: "MÁQ: Cadeira Extensora",
                  group: "Pernas",
                  name: "MÁQ: Cadeira Extensora",
                  defaultReps: 12,
                  tracksWeight: true
                },
                {
                  id: "m2-c-1b",
                  key: "HALTER: Stiff",
                  group: "Pernas",
                  name: "HALTER: Stiff",
                  defaultReps: 12,
                  tracksWeight: true
                }
              ]
            },
            {
              id: "Cir 2",
              sets: 3,
              repsTarget: "10 a 15",
              restBetweenSec: 10,
              restAfterSec: 60,
              exercises: [
                {
                  id: "m2-c-2a",
                  key: "MÁQ: Cadeira Abdutora",
                  group: "Pernas",
                  name: "MÁQ: Cadeira Abdutora",
                  defaultReps: 12,
                  tracksWeight: true
                },
                {
                  id: "m2-c-2b",
                  key: "DEGRAU+HALTER: Panturrilha, Unilateral",
                  group: "Pernas",
                  name: "DEGRAU+HALTER: Panturrilha, Unilateral",
                  defaultReps: 12,
                  tracksWeight: true
                }
              ]
            },
            {
              id: "Cir 3",
              sets: 3,
              repsTarget: "10 a 15",
              restBetweenSec: 10,
              restAfterSec: 60,
              exercises: [
                {
                  id: "m2-c-3a",
                  key: "MÁQ: Cadeira Adutora",
                  group: "Pernas",
                  name: "MÁQ: Cadeira Adutora",
                  defaultReps: 12,
                  tracksWeight: true
                },
                {
                  id: "m2-c-3b",
                  key: "EM PÉ: Abdutor de Perna",
                  group: "Coord",
                  name: "EM PÉ: Abdutor de Perna",
                  defaultReps: 12,
                  tracksWeight: false
                }
              ]
            },
            {
              id: "Cir 4",
              sets: 3,
              repsTarget: "10 a 15",
              restBetweenSec: 10,
              restAfterSec: 60,
              exercises: [
                {
                  id: "m2-c-4a",
                  key: "ARTICULADO: Remada, aberta",
                  group: "Costas",
                  name: "ARTICULADO: Remada, aberta",
                  defaultReps: 12,
                  tracksWeight: true
                },
                {
                  id: "m2-c-4b",
                  key: "YOGA: Postura do Pombo",
                  group: "Coord",
                  name: "YOGA: Postura do Pombo, Isom 10s cada",
                  defaultReps: 10,
                  unitLabel: "seg",
                  tracksWeight: false
                }
              ]
            },
            {
              id: "Cir 5",
              sets: 3,
              repsTarget: "10 a 15",
              restBetweenSec: 10,
              restAfterSec: 60,
              exercises: [
                {
                  id: "m2-c-5a",
                  key: "BANCO HORIZ+BARRA: Supino",
                  group: "Peito",
                  name: "B.HORIZ+BARRA: Supino",
                  defaultReps: 12,
                  tracksWeight: true
                },
                {
                  id: "m2-c-5b",
                  key: "Corrida: frente, trás",
                  group: "Coord",
                  name: "Corrida: frente, trás (3 passos)",
                  defaultReps: 12,
                  tracksWeight: false
                }
              ]
            }
          ]
        },
        D: {
          id: "D",
          title: "Treino D",
          subtitle: "Aeróbio, Bike / Elíptico (50 min)",
          type: "cardio",
          cooldown: "1x30s: Coxa (frente+atrás), Adut, Glút, Peito, Costas, Panturr, Pescç.",
          stages: [
            {
              id: "m2-d-1",
              step: "1",
              title: "Aquecimento (5 min)",
              description: "5 min = Aquecer: Leve/moderado",
              durationSec: 300,
              mode: "steady"
            },
            {
              id: "m2-d-2",
              step: "2",
              title: "Intervalado Moderado (16 min)",
              description: "16 min = 8x 2:00 (1:30 Carga média, velocidade média + 30s leve, recuperação)",
              durationSec: 960,
              mode: "interval",
              rounds: 8,
              workSec: 90,
              restSec: 30
            },
            {
              id: "m2-d-3",
              step: "3",
              title: "Recuperação Ativa (5 min)",
              description: "5 min = Leve, recuperação",
              durationSec: 300,
              mode: "steady"
            },
            {
              id: "m2-d-4",
              step: "4",
              title: "HIIT Sprint (12 min)",
              description: "12 min = 8x 1:30 (0:20 Carga e Velocid Máximas + 1:10 Leve, recuperação)",
              durationSec: 720,
              mode: "interval",
              rounds: 8,
              workSec: 20,
              restSec: 70
            },
            {
              id: "m2-d-5",
              step: "5",
              title: "Contínuo (12 min)",
              description: "12 min = Carga média, velocidade média, contínuo",
              durationSec: 720,
              mode: "steady"
            }
          ]
        }
      }
    },
    {
      id: "micro-01",
      name: "Micro 01",
      startDate: "2026-05-21",
      age: 40,
      weeklyGoal: 2,
      daysDescription: "2x na semana",
      cadence: "2020 (2s Concêntrica + 2s Excêntrica)",
      notes: "Fez cirurgia Lig. Patelar, já recuperado. Faz Tênis de Mesa e outros \"Cárdios\". AMPLITUDE: Máxima. CARGAS: Máximas, até falhar.",
      workouts: {
        A: {
          id: "A",
          title: "Treino A",
          subtitle: "Pernas, Costas, Peito, Braços & Ombros",
          type: "strength",
          warmup: "1x 10, carga 50%, pausa 15s, + 1x 5, Crg 100%, para cada grupo muscular.",
          cooldown: "1x30s: Coxa (frente e atrás), Adutores, Glúteos, Peito, Costas, Pescoço.",
          circuits: [
            {
              id: "Cir 1",
              sets: 3,
              repsTarget: "10 a 15",
              restBetweenSec: 10,
              restAfterSec: 45,
              exercises: [
                {
                  id: "m1-a-1a",
                  key: "LEG PRESS 45: Agachamento",
                  group: "Pernas",
                  name: "LEG PRESS 45: Agachamento",
                  defaultReps: 12,
                  tracksWeight: true
                },
                {
                  id: "m1-a-1b",
                  key: "HALTER: Crucifixo Invertido",
                  group: "Costas",
                  name: "HALTER: Crucifixo Invertido",
                  defaultReps: 12,
                  tracksWeight: true
                }
              ]
            },
            {
              id: "Cir 2",
              sets: 3,
              repsTarget: "10 a 15",
              restBetweenSec: 10,
              restAfterSec: 45,
              exercises: [
                {
                  id: "m1-a-2a",
                  key: "MÁQ: Cadeira Extensora",
                  group: "Pernas",
                  name: "MÁQ: Cadeira Extensora",
                  defaultReps: 12,
                  tracksWeight: true
                },
                {
                  id: "m1-a-2b",
                  key: "COLCH: Abdom Bicicleta",
                  group: "Abdom",
                  name: "COLCH: Abdom Bicicleta",
                  defaultReps: 15,
                  tracksWeight: false
                }
              ]
            },
            {
              id: "Cir 3",
              sets: 3,
              repsTarget: "10 a 15",
              restBetweenSec: 10,
              restAfterSec: 45,
              exercises: [
                {
                  id: "m1-a-3a",
                  key: "BANCO INCLIN+HALTER: Supino",
                  group: "Peito",
                  name: "BANCO INCLIN+HALTER: Supino",
                  defaultReps: 12,
                  tracksWeight: true
                },
                {
                  id: "m1-a-3b",
                  key: "HALTER: Stiff",
                  group: "Pernas",
                  name: "HALTER: Stiff",
                  defaultReps: 12,
                  tracksWeight: true
                }
              ]
            },
            {
              id: "Cir 4",
              sets: 3,
              repsTarget: "10 a 15",
              restBetweenSec: 10,
              restAfterSec: 45,
              exercises: [
                {
                  id: "m1-a-4a",
                  key: "POLIA.ALTA+BARRA: Puxada Aberta, frontal",
                  group: "Costas",
                  name: "POLIA.ALTA+BARRA: Puxada Aberta, frontal",
                  defaultReps: 12,
                  tracksWeight: true
                },
                {
                  id: "m1-a-4b",
                  key: "HALTER: Tríceps Francês",
                  group: "Braços",
                  name: "HALTER: Tríceps Francês",
                  defaultReps: 12,
                  tracksWeight: true
                }
              ]
            },
            {
              id: "Cir 5",
              sets: 3,
              repsTarget: "10 a 15",
              restBetweenSec: 10,
              restAfterSec: 45,
              exercises: [
                {
                  id: "m1-a-5a",
                  key: "HACK/LEG.MÁQUINA: Panturr, pés paralelos",
                  group: "Pernas",
                  name: "HACK/LEG.MÁQUINA: Panturr, pés paralel.",
                  defaultReps: 15,
                  tracksWeight: true
                },
                {
                  id: "m1-a-5b",
                  key: "Corrida: frente, trás",
                  group: "Coord",
                  name: "Corrida: frente, trás (5 passos)",
                  defaultReps: 12,
                  tracksWeight: false
                }
              ]
            },
            {
              id: "Cir 6",
              sets: 3,
              repsTarget: "10 a 15",
              restBetweenSec: 10,
              restAfterSec: 45,
              exercises: [
                {
                  id: "m1-a-6a",
                  key: "HALTER: Desenvolvimento Arnold",
                  group: "Ombros",
                  name: "HALTER: Desenvolvimento Arnold",
                  defaultReps: 12,
                  tracksWeight: true
                },
                {
                  id: "m1-a-6b",
                  key: "YOGA: Postura da Lua Crescente",
                  group: "Coord",
                  name: "YOGA: Postura da Lua Crescente, Isom2s",
                  defaultReps: 10,
                  tracksWeight: false
                }
              ]
            }
          ]
        },
        B: {
          id: "B",
          title: "Treino B",
          subtitle: "Peito, Pernas, Costas, Abdom & Braços",
          type: "strength",
          warmup: "1x 10, carga 50%, pausa 15s, + 1x 5, Crg 100%, para cada grupo muscular.",
          cooldown: "1x30s: Coxa (frente e atrás), Adutores, Glúteos, Peito, Costas, Pescoço.",
          circuits: [
            {
              id: "Cir 1",
              sets: 3,
              repsTarget: "10 a 15",
              restBetweenSec: 10,
              restAfterSec: 45,
              exercises: [
                {
                  id: "m1-b-1a",
                  key: "BANCO HORIZ+BARRA: Supino",
                  group: "Peito",
                  name: "BANCO HORIZ+BARRA: Supino",
                  defaultReps: 12,
                  tracksWeight: true
                },
                {
                  id: "m1-b-1b",
                  key: "HALTER: Afundo",
                  group: "Pernas",
                  name: "HALTER: Afundo",
                  defaultReps: 12,
                  tracksWeight: true
                }
              ]
            },
            {
              id: "Cir 2",
              sets: 3,
              repsTarget: "10 a 15",
              restBetweenSec: 10,
              restAfterSec: 45,
              exercises: [
                {
                  id: "m1-b-2a",
                  key: "MÁQ: Cadeira Flexora",
                  group: "Pernas",
                  name: "MÁQ: Cadeira Flexora",
                  defaultReps: 12,
                  tracksWeight: true
                },
                {
                  id: "m1-b-2b",
                  key: "YOGA: Postura do Camelo Isometria 2s",
                  group: "Coord",
                  name: "YOGA: Postura do Camelo Isometria 2s",
                  defaultReps: 10,
                  tracksWeight: false
                }
              ]
            },
            {
              id: "Cir 3",
              sets: 3,
              repsTarget: "10 a 15",
              restBetweenSec: 10,
              restAfterSec: 45,
              exercises: [
                {
                  id: "m1-b-3a",
                  key: "B.HORIZ+HALTER: Crucifixo",
                  group: "Peito",
                  name: "B.HORIZ+HALTER: Crucifixo",
                  defaultReps: 12,
                  tracksWeight: true
                },
                {
                  id: "m1-b-3b",
                  key: "COLCH: Abdm Infra, Dragon Flag",
                  group: "Abdom",
                  name: "COLCHONETE: Abdm Infra, Dragon Flag",
                  defaultReps: 12,
                  tracksWeight: false
                }
              ]
            },
            {
              id: "Cir 4",
              sets: 3,
              repsTarget: "10 a 15",
              restBetweenSec: 10,
              restAfterSec: 45,
              exercises: [
                {
                  id: "m1-b-4a",
                  key: "ARTICULADO: Remada, aberta",
                  group: "Costas",
                  name: "ARTICULADO: Remada, aberta",
                  defaultReps: 12,
                  tracksWeight: true
                },
                {
                  id: "m1-b-4b",
                  key: "EM PÉ: Abdutor de Perna",
                  group: "Coord",
                  name: "EM PÉ: Abdutor de Perna",
                  defaultReps: 12,
                  tracksWeight: false
                }
              ]
            },
            {
              id: "Cir 5",
              sets: 3,
              repsTarget: "10 a 15",
              restBetweenSec: 10,
              restAfterSec: 45,
              exercises: [
                {
                  id: "m1-b-5a",
                  key: "BANCO OBLÍQUO: Extensão Lombar",
                  group: "Pernas",
                  name: "BANCO OBLÍQUO: Extensão Lombar",
                  defaultReps: 12,
                  tracksWeight: true
                },
                {
                  id: "m1-b-5b",
                  key: "YOGA: Postura do Pombo",
                  group: "Coord",
                  name: "YOGA: Postura do Pombo, Isometria 2s",
                  defaultReps: 10,
                  tracksWeight: false
                }
              ]
            },
            {
              id: "Cir 6",
              sets: 3,
              repsTarget: "10 a 15",
              restBetweenSec: 10,
              restAfterSec: 45,
              exercises: [
                {
                  id: "m1-b-6a",
                  key: "HALTER: Bíceps Rosca Direta",
                  group: "Braços",
                  name: "HALTER: Bíceps Rosca Direta",
                  defaultReps: 12,
                  tracksWeight: true
                },
                {
                  id: "m1-b-6b",
                  key: "Cócoras, Isometria",
                  group: "Coord",
                  name: "Cócoras, Isometria 10s",
                  defaultReps: 10,
                  unitLabel: "seg",
                  tracksWeight: false
                }
              ]
            }
          ]
        }
      }
    }
  ]
};
