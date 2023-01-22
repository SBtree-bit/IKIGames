function ItemType(params) {
    this.name = params.name || "undefined"
    this.tooltip = params.tooltip || this.name
    this.maxStackSize = params.maxStackSize || 10
    this.category = params.category || "other"
    this.icon = params.icon || ""
    this.model = params.model || ""
}

function ItemStack(type) {
    this.type = type
    this.size = 1
}

function Inventory(params1) {
    console.log("hello")
    let categories = [
        "other",
        "attack",
        "defense",
        "headgear",
        "crates",
        "food",
        "currency",
        "materials"
    ]
    console.log(categories)
    let params = params1
    if (!params) params = {}
    this.slotObj = params.slotObj || {}
    this.mainItems = params.mainItems || {}
    for (var i = 0; i < categories.length; i++) {
        this.slotObj[categories[i]] = [undefined, undefined, undefined, undefined, undefined]
        this.mainItems[categories[i]] = undefined
    }
}

function createInventory() {
    var inventory = new Inventory()
    let types = {
        "air": { "name": "", "tooltip": "", "maxStackSize": 1, "category": "any", "model": "2023_Snowman.glb"},
        "button": { "name": "Button", "tooltip": "Button\nA button you press", "icon": "./models/items/icon.png", "model": "2023_Snowman.glb" },
        "speedometer": {"name": "Speedometer", "tooltip": "A perfect item for measuring speed!", "icon": "./models/items/speedometer.jpeg", "model": "2023_Snowman.glb"}
    }
    inventory.slotObj.other[0] = new ItemStack(types.button)
    return [inventory, types]
}

export { createInventory, Inventory, ItemStack, ItemType }