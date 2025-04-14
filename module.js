export const PrettyJSON = function(spacing) {
    this.spacing = spacing;
    this.jsonString = "";
    this.writes = 0;
    this.openLists = [];
}

PrettyJSON.LIST_TYPE = {
    OBJECT: 0,
    ARRAY: 1
};

PrettyJSON.prototype.pad = function(depth) {
    const whitespace = depth * this.spacing;

    for(let i = 0; i < whitespace; i++) {
        this.jsonString += " ";
    }
}

PrettyJSON.prototype.newLine = function(depth) {
    if(this.openLists.length === 0) {
        if(this.writes > 0) {
            this.jsonString += ",\n";
        }
    } else {
        const list = this.openLists[this.openLists.length - 1];
        const { writes } = list;

        if(writes > 0) {
            this.jsonString += ",\n";
        }
    }

    this.pad(depth);
}

PrettyJSON.prototype.newEmptyLine = function(depth) {
    this.jsonString += "\n";
    this.pad(depth);
}

PrettyJSON.prototype.getJoinString = function(depth) {
    let join = ",\n";
    const whitespace = depth * this.spacing;

    for(let i = 0; i < whitespace; i++) {
        join += " ";
    }

    return join;
}

PrettyJSON.prototype.open = function(depth = 0, name) {
    this.pad(depth);

    if(name) {
        this.jsonString += `"${name}": {\n`;
    } else {
        this.jsonString += "{\n";
    }

    return this;
}

PrettyJSON.prototype.close = function(depth = 0) {
    while(this.openLists.length !== 0) {
        this.closeList();
    }

    this.newEmptyLine(depth);
    this.jsonString += "}";

    return this;
}

PrettyJSON.prototype.writeLine = function(id, depth, data) {
    this.newLine(depth);
    this.jsonString += `"${id}": ${JSON.stringify(data)}`;

    if(this.openLists.length === 0) {
        this.writes++;
    } else {
        const list = this.openLists[this.openLists.length - 1];
        list.writes++;
    }

    return this;
}

PrettyJSON.prototype.openList = function(id, depth, type) {
    if(type === undefined) {
        type = PrettyJSON.LIST_TYPE.OBJECT;
    }

    switch(type) {
        case PrettyJSON.LIST_TYPE.OBJECT: {
            this.newLine(depth);
            this.jsonString += `"${id}": {\n`;
            break;
        }
        case PrettyJSON.LIST_TYPE.ARRAY: {
            this.newLine(depth);
            this.jsonString += `"${id}": [\n`;
            break;
        }
    }

    this.openLists.push({
        "type": type,
        "depth": depth,
        "writes": 0
    });

    return this;
}

PrettyJSON.prototype.writeList = function(id, depth, jsonStrings, type) {
    const nestedDepth = depth + 1;
    const joinString = this.getJoinString(nestedDepth);
    const joined = jsonStrings.join(joinString);

    this.openList(id, depth, type);
    this.pad(nestedDepth);
    this.jsonString += joined;
    this.closeList();

    return this;
}

PrettyJSON.prototype.closeList = function() {
    if(this.openLists.length === 0) {
        return this;
    }

    const list = this.openLists.pop();
    const { depth, type } = list;

    switch(type) {
        case PrettyJSON.LIST_TYPE.OBJECT: {
            this.newEmptyLine(depth);
            this.jsonString += "}";
            break;
        }
        case PrettyJSON.LIST_TYPE.ARRAY: {
            this.newEmptyLine(depth);
            this.jsonString += "]";
            break;
        }
    }

    if(this.openLists.length === 0) {
        this.writes++;
    } else {
        const list = this.openLists[this.openLists.length - 1];
        list.writes++;
    }

    return this;
}

PrettyJSON.prototype.build = function() {
    return this.jsonString;
}

PrettyJSON.prototype.reset = function() {
    this.openLists = [];
    this.jsonString = "";
    this.writes = 0;

    return this;
}

PrettyJSON.prototype.download = function(filename) {
    const blob = new Blob([this.jsonString], { type: "text/json" });
    const link = document.createElement("a");
  
    link.download = `${filename}.json`;
    link.href = window.URL.createObjectURL(blob);
    link.dataset.downloadurl = ["text/json", link.download, link.href].join(":");
  
    const evt = new MouseEvent("click", {
        view: window,
        bubbles: true,
        cancelable: true,
    });
  
    link.dispatchEvent(evt);
    link.remove();
}