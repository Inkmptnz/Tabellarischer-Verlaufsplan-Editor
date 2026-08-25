const presetModules = import.meta.glob('../presets/*.json', { eager: true })

const presets = []
for (const dateiname in presetModules) {
  const name = getPresetName(dateiname)
  const columns = getColumns(presetModules[dateiname])
  const preset = {}
  preset.name = name
  preset.columns = columns
  presets.push(preset)
}

console.log(presets)

function getPresetName(fileName) {
  const split = fileName.split('/')
  const nameWithExtension = split[split.length - 1]
  const name = nameWithExtension.slice(0, -5)
  return name
}

function getColumns(json) {
  return json.default
}

export function usePresets() {
  return { presets }
}
