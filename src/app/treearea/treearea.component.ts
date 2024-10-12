import { AfterViewInit, Component, Inject, Input, PLATFORM_ID } from '@angular/core';
import { Info } from '../Info';
import { isPlatformBrowser } from '@angular/common';
import { hierarchy, linkVertical, select, tree, zoom, ZoomBehavior, zoomIdentity } from 'd3';
import { Selection } from 'd3-selection';

@Component({
  selector: 'ftapp-tree-area',
  templateUrl: './treearea.component.html',
  styleUrls: ['./treearea.component.scss']
})
export class TreeAreaComponent implements AfterViewInit {
  //@Input() birthEvents: { name: string, birthyear: number }[] = [];
  @Input() treeData: any;
  @Input() treeInfo:Info={
    nr_people:0,
    inverted:false
  };

  width: number=0;
  height: number=0;
  innerWidth:number=0;
  innerHeight:number=0;
  svg!: Selection<SVGSVGElement, unknown, HTMLElement, any>;  // Properly typed SVG selection
  g!: Selection<SVGGElement, unknown, HTMLElement, any>;      // For the G element
  treeLayout: any;
  margin={top:0,right:0,bottom:0,left:0};


  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    // Check if this is a browser environment
    if (isPlatformBrowser(this.platformId)) {
      this.width = document.body.clientWidth;
      this.height = document.body.clientHeight;

      this.innerWidth = this.width - this.margin.left - this.margin.right;
      this.innerHeight = this.height - this.margin.top - this.margin.bottom;
    }
  }

  ngAfterViewInit(): void {
    // Create the SVG element and set its width/height
    this.svg = select<SVGSVGElement, unknown>('svg#tree-svg')
      .attr('width', this.width)
      .attr('height', this.height);

    // Append the <defs> element for defining reusable patterns
  const defs = this.svg.append('defs');

  // Define the grid pattern
  defs.append('pattern')
    .attr('id', 'grid-pattern')
    .attr('width', 20)  // Adjust grid size
    .attr('height', 20)
    //.attr('patternUnits', 'userSpaceOnUse')  // To make the grid scale properly with zoom
    .append('path')
    .attr('d', 'M 20 0 L 0 0 0 20')
    .attr('fill', 'none')
    .attr('stroke', '#ddd')
    .attr('stroke-width', 0.5);

  // Add the grid to the background
  this.svg.append('rect')
    .attr('width', this.width)
    .attr('height', this.height)
    .attr('fill', 'url(#grid-pattern)');
  
    // Append the <g> element and store it in the 'g' variable
    this.g = this.svg
      .append('g')
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);
  
    // Define zoom behavior
    const zoomBehavior: ZoomBehavior<any, unknown> = zoom().on('zoom', (event) => {
      this.g.attr('transform', event.transform); // Apply zoom and pan transformations
    });
  
    // Apply zoom behavior to the SVG element
    this.svg.call(zoomBehavior);
  
    // Initial Zoom Transformation (zoom out to show the entire tree)
    const initialScale = 0.4; // Adjust the scale to zoom out (smaller value zooms out more)
    const initialX = this.width / 25; // Center horizontally
    const initialY = this.height / 3; // Center vertically
  
    this.svg.call(zoomBehavior.transform, zoomIdentity.translate(initialX, initialY).scale(initialScale));
  
    // Set tree layout with dynamic size based on data depth
    if (this.treeData) {
      const root = hierarchy(this.treeData);
      const maxDepth = root.height;
  
      // Set dynamic height and width
      const dynamicHeight = Math.max(maxDepth * 30, 200); // Adjust for height based on depth
      const dynamicWidth = this.innerWidth * 10; // Adjust width dynamically
  
      this.treeLayout = tree().size([dynamicHeight, dynamicWidth]);
  
      // Render the tree (inverted or regular based on your preference)
      // Check if the first name in the tree data is "Boros Titusz"
      // console.log("first name found"+this.treeData[0]?.name);
      // if (this.treeData[0]?.name === 'Boros Titusz') {
      //   this.renderInvertedTree();  // If inverted tree, call renderInvertedTree
      // } else {
      //   this.renderTree();  // Otherwise, call renderTree
      // }

      const treeInfo = this.treeData.info; // Extract info from the passed treeData
      console.log("Info Data:", treeInfo);

      // Render based on treeInfo
      //console.log("boolean value="+this.treeData.info.inverted);
      if (treeInfo.inverted) {
        console.log("rendering inverted tree");
        this.renderInvertedTree();
      } else {
        console.log("rendering not inverted tree");
        this.renderTree();
      }
    }
  }
  
  ngOnChanges(): void {
    if (this.treeData) {
      const root = hierarchy(this.treeData);
      const maxDepth = root.height;
      //1350, 30 for super wide
      const dynamicHeight = maxDepth * 900;
      const dynamicWidth = maxDepth * 60;
      // Make sure to reassign treeLayout when treeData changes
      this.treeLayout = tree().size([dynamicHeight, dynamicWidth]);
  
      // Check if the first name in the tree data is "Boros Titusz"
      // console.log("first name found"+this.treeData[0]?.name);
      // if (this.treeData[0]?.name === 'Boros Titusz') {
      //   this.renderInvertedTree();  // If inverted tree, call renderInvertedTree
      // } else {
      //   this.renderTree();  // Otherwise, call renderTree
      // }

        // Access the info part directly from treeData
      const treeInfo = this.treeData.info; // Extract info from the passed treeData
      console.log("Info Data:", treeInfo);

      // Render based on treeInfo
      console.log(treeInfo.inverted);
      console.log(treeInfo.nr_people);
      if (treeInfo.inverted) {
        console.log("rendering inverted tree");
        this.renderInvertedTree();
      } else {
        console.log("rendering not inverted tree");
        this.renderTree();
      }
    }
  }

  renderTree(): void {
    console.log('Rendering tree with data:', this.treeData);

    // Remove existing links and nodes before drawing new ones
    this.g.selectAll('path').remove();  // Remove old links
    this.g.selectAll('g.node').remove();  // Remove old nodes

    // Build the hierarchy from the data
    const root = hierarchy(this.treeData);

    // Generate the links and nodes
    const treeData = this.treeLayout(root);
    const links = treeData.links();
    const nodes = treeData.descendants();

    // Link path generator
    const linkPathGenerator = linkVertical<any, any>()
      .x(d => d.x)  // Adjust to the tree layout's coordinate system
      .y(d => d.y);

    // Log the links and nodes for debugging purposes
    console.log('Links:', links);
    console.log('Nodes:', nodes);

    // Draw the links (paths between nodes)
    this.g.selectAll('path')
      .data(links)
      .enter()
      .append('path')
      .attr('d', d => linkPathGenerator(d))  // Call the linkPathGenerator with each data point
      .attr('stroke', '#add8e6')  // Optional styling
      .attr('fill', 'none');   // Optional styling

    // Draw nodes (groups of nodes)
    const nodeGroup = this.g.selectAll('g.node')
      .data(root.descendants(), (d: any) => d.data.name)  // Use a unique identifier for data binding
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.x}, ${d.y})`);  // Position group at node's coordinates

    // Add the text labels to each node
    nodeGroup.append('text')
      .attr('dy', '0.32em')
      .style('font-size', d => (1 - d.depth * 0.1) + 'em')
      .text(d => `${d.data?.data?.name || 'missing'} & ${d.data?.data?.pname || ''}`);  // Safely access data.id with a fallback value

    // Draw the additional text (e.g., "test") below the existing text
    nodeGroup.append('text')
      .attr('dy', '1.5em')  // Shift down by 1.5em below the previous text
      .style('font-size', d => (1 - d.depth * 0.1) + 'em')
      .attr('fill', 'gray')  // Optional styling, making the text gray
      .text(d => 
        `${d.data?.data?.by || ''} - ${d.data?.data?.dy || ''}, ` +
        `${d.data?.data?.pby || ''} - ${d.data?.data?.pdy || ''}`
      );
  }

  renderInvertedTree(): void {
    console.log('Rendering inverted tree with data:', this.treeData);

    // Remove existing links and nodes before drawing new ones
    this.g.selectAll('path').remove();  // Remove old links
    this.g.selectAll('g.node').remove();  // Remove old nodes

    // Build the hierarchy from the data
    const root = hierarchy(this.treeData);

    // Generate the links and nodes
    const treeData = this.treeLayout(root);
    const links = treeData.links();
    const nodes = treeData.descendants();

    // Link path generator
    const linkPathGenerator = linkVertical<any, any>()
      .x(d => d.x)  // Adjust to the tree layout's coordinate system
      .y(d => -d.y);  // Inverted Y-axis

    // Log the links and nodes for debugging purposes
    console.log('Links:', links);
    console.log('Nodes:', nodes);

    // Draw the links (paths between nodes)
    this.g.selectAll('path')
      .data(links)
      .enter()
      .append('path')
      .attr('d', d => linkPathGenerator(d))  // Call the linkPathGenerator with each data point
      .attr('stroke', '#add8e6')  // Optional styling
      .attr('fill', 'none');   // Optional styling

    // Draw nodes (groups of nodes)
    const nodeGroup = this.g.selectAll('g.node')
      .data(root.descendants(), (d: any) => d.data.name)  // Use a unique identifier for data binding
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.x}, ${-(d.y ?? 0)})`);  // Position group at node's coordinates

    // Add the text labels to each node
    nodeGroup.append('text')
      .attr('dy', '0.32em')
      .style('font-size', d => (1 - d.depth * 0.1) + 'em')
      .text(d => `${d.data?.data?.name || 'missing'}`);  // Safely access data.id with a fallback value

    // Draw the additional text (e.g., "test") below the existing text
    nodeGroup.append('text')
      .attr('dy', '1.5em')  // Shift down by 1.5em below the previous text
      .style('font-size', d => (1 - d.depth * 0.1) + 'em')
      .attr('fill', 'gray')  // Optional styling, making the text gray
      .text(d => 
        `${d.data?.data?.by || ''} - ${d.data?.data?.dy || ''} `
      );
  }

}
