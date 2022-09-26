/** Class representing a Tree. */
class Tree {
  nodes;
  /**
   * Creates a Tree Object
   * Populates a single attribute that contains a list (array) of Node objects to be used by the other functions in this class
   * @param {json[]} json - array of json objects with name and parent fields
   */
  constructor(json) 
  {
    this.nodes = [];

    for(let node of json )
    {
      this.nodes.push(new Node(node.name, node.parent));
    }

    for(let node of this.nodes)
    {
      node.parentNode = this.nodes.find(function(n){
          n.name === node.parentName
      });
    }
  }

  /**
   * Assign other required attributes for the nodes.
   */
  buildTree () 
  {
    // note: in this function you will assign positions and levels by making calls to assignPosition() and assignLevel()
    for(let node of this.nodes)
    {
      node.children = this.nodes.filter(function(n){ 
          if (n.parentName === node.name)
          {
            return n; 
          }
      });
    }
    this.assignLevel(this.nodes.find(function(n){
      if (n.parentName === 'root')
      {
        return n; 
      }
    }), 0);
    this.assignPosition(this.nodes.find(function(n){
        if (n.parentName === 'root')
        {
          return n; 
        }
      }), 0);
  }

  /**
   * Recursive function that assign levels to each node
   */
  assignLevel (node, level) 
  {
    node.level = level;

    for(let child of node.children)
    {
      this.assignLevel(child, level + 1);
    }
  }

  /**
   * Recursive function that assign positions to each node
   */
  assignPosition (node, position) 
  {
    node.position = position; 

    for(let child of node.children)
    {
      let temp = this.assignPosition(child, position);

      if (temp > position + 1)
      {
        position = temp;
      }
      else 
      {
        position += 1; 
      }
    }
    return position;
  }

  /**
   * Function that renders the tree
   */
  renderTree () {
    let x = 50
    let y = 50

    this.drawLines(this.nodes[0], x, y)

    let g = this.svg.append("g")
      .attr("transform", function (d, i) {
        return "translate(0,0)";
      });

    g.append('circle')
      .attr("cx", x)
      .attr("cy", y)
      .attr("r", 40)
      .append("text")

    g.append("text")
      .attr("x", x)
      .attr("y", y)
      .attr("class", "label")
      .attr("text-anchor", "middle")
      .text(this.nodes[0].name);

    this.drawChildNodes(this.nodes[0], x, y)
  }

  drawLines(parent, pX, pY) {
    parent.children.forEach(child => {
      let cX = child.level * 140 + 50
      let cY = child.position * 85 + 50
      this.svg.append("line")
        .attr("x1", pX)
        .attr("x2", cX)
        .attr("y1", pY)
        .attr("y2", cY)

      this.drawLines(child, cX, cY)
    })
  }

  drawChildNodes(parent, pX, pY) {

    parent.children.forEach(child => {
      let cX = child.level * 140 + 50
      let cY = child.position * 85 + 50

      let g = this.svg.append("g")
        .attr("transform", function (d, i) {
          return "translate(0,0)";
        });

      let circle = g.append('circle')
        .attr("cx", cX)
        .attr("cy", cY)
        .attr("r", 40)
        .attr("fill", "green")
        .append("text")

      g.append("text")
        .attr("x", cX)
        .attr("y", cY)
        .attr("text-anchor", "middle")
        .attr("class", "label")
        .text(child.name);

      this.drawChildNodes(child, cX, cY)
    })

  }
}