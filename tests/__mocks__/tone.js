const mockStart = jest.fn().mockReturnThis();
const mockStop = jest.fn().mockReturnThis();
const mockConnect = jest.fn().mockReturnThis();
const mockDisconnect = jest.fn().mockReturnThis();
const mockSetValue = jest.fn().mockReturnThis();
const mockToDestination = jest.fn().mockReturnThis();
const mockToMaster = jest.fn().mockReturnThis();
const mockDispose = jest.fn().mockReturnThis();

const createSynthWithDispose = () => ({
  connect: mockConnect,
  disconnect: mockDisconnect,
  toDestination: mockToDestination,
  toMaster: mockToMaster,
  dispose: mockDispose,
  triggerAttackRelease: jest.fn().mockResolvedValue(undefined)
});

module.exports = {
  start: mockStart,
  Transport: {
    start: mockStart,
    stop: mockStop,
    bpm: { value: 120 }
  },
  Synth: jest.fn().mockImplementation(createSynthWithDispose),
  MembraneSynth: jest.fn().mockImplementation(createSynthWithDispose),
  Volume: jest.fn().mockImplementation(() => ({
    value: 0,
    connect: mockConnect,
    disconnect: mockDisconnect,
    toDestination: mockToDestination,
    toMaster: mockToMaster,
    set: mockSetValue,
    dispose: mockDispose
  })),
  Recorder: jest.fn().mockImplementation(() => ({
    start: mockStart,
    stop: mockStop,
    dispose: mockDispose
  }))
}; 