import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreeareaComponent } from './treearea.component';

describe('TreeareaComponent', () => {
  let component: TreeareaComponent;
  let fixture: ComponentFixture<TreeareaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TreeareaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TreeareaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
