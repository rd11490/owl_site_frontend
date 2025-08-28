import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlotComponent } from './plot.component';
import { PlotData } from './models';

describe('PlotComponent', () => {
  let component: PlotComponent;
  let fixture: ComponentFixture<PlotComponent>;
  let svg: SVGElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PlotComponent]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlotComponent);
    component = fixture.componentInstance;
    
    // Create SVG element that the component expects
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'plot');
    svg.setAttribute('id', 'plot');
    svg.setAttribute('width', '1200');
    svg.setAttribute('height', '700');
    document.body.appendChild(svg);
    
    fixture.detectChanges();
  });

  afterEach(() => {
    document.body.removeChild(svg);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default empty data', () => {
    expect(component.data).toBeTruthy();
    expect(component.data.data).toEqual([]);
    expect(component.data.xLabel).toBe('No Data');
    expect(component.data.yLabel).toBe('No Data');
  });

  it('should update plot when data is set', () => {
    const testData: PlotData = {
      data: [
        {
          color: '#ff0000',
          label: 'Test Point',
          size: 10,
          sizeLabel: '10',
          x: 5,
          xLabel: '5',
          y: 3,
          yLabel: '3'
        }
      ],
      xLabel: 'Test X',
      yLabel: 'Test Y'
    };

    // Spy on the plotData method
    const plotDataSpy = spyOn<any>(component, 'plotData');
    
    // Set the data
    component.data = testData;
    fixture.detectChanges();

    // Verify the data was set
    expect(component['_data']).toEqual(testData);
    
    // Verify plotData was called
    expect(plotDataSpy).toHaveBeenCalled();
  });

  it('should create SVG elements when plotting data', () => {
    const testData: PlotData = {
      data: [
        {
          color: '#ff0000',
          label: 'Test Point',
          size: 10,
          sizeLabel: '10',
          x: 5,
          xLabel: '5',
          y: 3,
          yLabel: '3'
        }
      ],
      xLabel: 'Test X',
      yLabel: 'Test Y'
    };

    // Set the data
    component.data = testData;
    fixture.detectChanges();

    // Check that SVG elements were created
    const circles = document.querySelectorAll('circle');
    expect(circles.length).toBe(1);

    const texts = document.querySelectorAll('.x-axis text, .y-axis text');
    expect(texts.length).toBeGreaterThan(0);

    // Check axis labels
    const xLabel = document.querySelector('.x-axis text:last-child');
    const yLabel = document.querySelector('.y-axis text:last-child');
    expect(xLabel?.textContent).toBe('Test X');
    expect(yLabel?.textContent).toBe('Test Y');
  });

  it('should handle undefined data gracefully', () => {
    component.data = undefined;
    fixture.detectChanges();
    
    // Should still have the default data
    expect(component['_data'].data).toEqual([]);
    expect(component['_data'].xLabel).toBe('No Data');
    expect(component['_data'].yLabel).toBe('No Data');
  });

  it('should clear plot when requested', () => {
    const testData: PlotData = {
      data: [
        {
          color: '#ff0000',
          label: 'Test Point',
          size: 10,
          sizeLabel: '10',
          x: 5,
          xLabel: '5',
          y: 3,
          yLabel: '3'
        }
      ],
      xLabel: 'Test X',
      yLabel: 'Test Y'
    };

    // Set initial data
    component.data = testData;
    fixture.detectChanges();

    // Clear the plot
    component.clearPlot();
    fixture.detectChanges();

    // Verify all elements were removed
    const circles = document.querySelectorAll('circle');
    expect(circles.length).toBe(0);
  });
});
