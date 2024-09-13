import {makeScene2D, Rect, Txt, Line, Circle} from '@motion-canvas/2d';
import {all, createRef, makeRef, range, Reference, ThreadGenerator, waitFor} from '@motion-canvas/core';

export default makeScene2D(function* (view) {
  const lomutoNumbers = [4, 2, 8, 3, 1, 5, 7, 6];
  const hoareNumbers = [4, 2, 8, 3, 1, 5, 7, 6];
  const boxSize = 50;
  const spacing = 10;
  const yOffset = 100;

  // Create boxes for Lomuto
  const lomutoBoxes: Reference<Rect>[] = [];
  const lomutoTexts: Reference<Txt>[] = [];
  
  // Create boxes for Hoare
  const hoareBoxes: Reference<Rect>[] = [];
  const hoareTexts: Reference<Txt>[] = [];

  // Helper function to create boxes and texts
  function* createBoxesAndTexts(boxes: Reference<Rect>[], texts: Reference<Txt>[], numbers: number[], y: number) {
    for (let i = 0; i < numbers.length; i++) {
      const box = createRef<Rect>();
      const text = createRef<Txt>();
      
      view.add(
        <Rect
          ref={box}
          width={boxSize}
          height={boxSize}
          x={i * (boxSize + spacing) - (numbers.length * (boxSize + spacing)) / 2 + boxSize / 2}
          y={y}
          fill="#3a86ff"
        />
      );
      
      view.add(
        <Txt
          ref={text}
          text={numbers[i].toString()}
          x={box().position.x()}
          y={box().position.y()}
          fontSize={24}
        />
      );
      
      boxes.push(box);
      texts.push(text);
    }
  }

  // Create Lomuto boxes and texts
  yield* createBoxesAndTexts(lomutoBoxes, lomutoTexts, lomutoNumbers, -yOffset);

  // Create Hoare boxes and texts
  yield* createBoxesAndTexts(hoareBoxes, hoareTexts, hoareNumbers, yOffset);

  // Lomuto partition algorithm
  function* lomutoPartition(low: number, high: number): ThreadGenerator {
    const pivot = createRef<Circle>();
    view.add(
      <Circle
        ref={pivot}
        size={20}
        fill="#ff006e"
        y={-yOffset - boxSize / 2 - 20}
        x={lomutoBoxes[high]().position.x()}
      />
    );

    const i = createRef<Line>();
    const j = createRef<Line>();
    
    view.add(
      <Line
        ref={i}
        points={[0, 0, 0, boxSize + 20]}
        stroke="#8338ec"
        lineWidth={3}
        endArrow
        y={-yOffset + boxSize / 2 + 10}
        x={lomutoBoxes[low]().position.x()}
      />
    );

    view.add(
      <Line
        ref={j}
        points={[0, 0, 0, boxSize + 20]}
        stroke="#fb5607"
        lineWidth={3}
        endArrow
        y={-yOffset + boxSize / 2 + 10}
        x={lomutoBoxes[low]().position.x()}
      />
    );

    let pivotValue = lomutoNumbers[high];
    let i_index = low - 1;

    for (let j_index = low; j_index < high; j_index++) {
      yield* j().position.x(lomutoBoxes[j_index]().position.x(), 0.3);

      if (lomutoNumbers[j_index] <= pivotValue) {
        i_index++;
        yield* i().position.x(lomutoBoxes[i_index]().position.x(), 0.3);
        
        yield* all(
          lomutoTexts[i_index]().text(lomutoNumbers[j_index].toString(), 0.3),
          lomutoTexts[j_index]().text(lomutoNumbers[i_index].toString(), 0.3)
        );
        [lomutoNumbers[i_index], lomutoNumbers[j_index]] = [lomutoNumbers[j_index], lomutoNumbers[i_index]];
      }

      yield* waitFor(0.2);
    }

    i_index++;
    yield* all(
      i().position.x(lomutoBoxes[i_index]().position.x(), 0.3),
      lomutoTexts[i_index]().text(pivotValue.toString(), 0.3),
      lomutoTexts[high]().text(lomutoNumbers[i_index].toString(), 0.3),
      pivot().position.x(lomutoBoxes[i_index]().position.x(), 0.3)
    );
    [lomutoNumbers[i_index], lomutoNumbers[high]] = [lomutoNumbers[high], lomutoNumbers[i_index]];

    yield* waitFor(0.5);
    pivot().remove();
    i().remove();
    j().remove();

    return i_index;
  }

  // Corrected Hoare partition algorithm
  function* hoarePartition(low: number, high: number): ThreadGenerator {
    const pivot = createRef<Circle>();
    const pivotIndex = Math.floor((low + high) / 2);
    const pivotValue = hoareNumbers[pivotIndex];
    
    view.add(
      <Circle
        ref={pivot}
        size={20}
        fill="#ff006e"
        y={yOffset - boxSize / 2 - 20}
        x={hoareBoxes[pivotIndex]().position.x()}
      />
    );

    const left = createRef<Line>();
    const right = createRef<Line>();
    
    view.add(
      <Line
        ref={left}
        points={[0, 0, 0, boxSize + 20]}
        stroke="#8338ec"
        lineWidth={3}
        endArrow
        y={yOffset + boxSize / 2 + 10}
        x={hoareBoxes[low]().position.x()}
      />
    );

    view.add(
      <Line
        ref={right}
        points={[0, 0, 0, boxSize + 20]}
        stroke="#fb5607"
        lineWidth={3}
        endArrow
        y={yOffset + boxSize / 2 + 10}
        x={hoareBoxes[high]().position.x()}
      />
    );

    while (true) {
      while (hoareNumbers[low] < pivotValue) {
        low++;
        yield* left().position.x(hoareBoxes[low]().position.x(), 0.3);
        yield* waitFor(0.2);
      }

      while (hoareNumbers[high] > pivotValue) {
        high--;
        yield* right().position.x(hoareBoxes[high]().position.x(), 0.3);
        yield* waitFor(0.2);
      }

      if (low >= high) {
        pivot().remove();
        left().remove();
        right().remove();
        return high;
      }

      yield* all(
        hoareTexts[low]().text(hoareNumbers[high].toString(), 0.3),
        hoareTexts[high]().text(hoareNumbers[low].toString(), 0.3)
      );
      [hoareNumbers[low], hoareNumbers[high]] = [hoareNumbers[high], hoareNumbers[low]];

      yield* waitFor(0.3);
    }
  }

  // Lomuto quicksort
  function* lomutoQuicksort(low: number, high: number): ThreadGenerator {
    if (low < high) {
      const pi = yield* lomutoPartition(low, high);
      yield* lomutoQuicksort(low, pi - 1);
      yield* lomutoQuicksort(pi + 1, high);
    }
  }

  // Hoare quicksort
  function* hoareQuicksort(low: number, high: number): ThreadGenerator {
    if (low < high) {
      const pi = yield* hoarePartition(low, high);
      yield* hoareQuicksort(low, pi);
      yield* hoareQuicksort(pi + 1, high);
    }
  }

  // Run both quicksort algorithms simultaneously
  yield* all(
    lomutoQuicksort(0, lomutoNumbers.length - 1),
    hoareQuicksort(0, hoareNumbers.length - 1)
  );

  // Final pause to show the sorted arrays
  yield* waitFor(2);
});
