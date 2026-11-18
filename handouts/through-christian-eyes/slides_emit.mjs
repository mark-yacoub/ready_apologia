/**
 * Google Slides REST API batchUpdate request serializer for multi-panel print layouts.
 * Decoupled from copy and layout measurement: consumes positioned primitive elements
 * (`text`, `line`, `frame`, `circle`, `bar`, `rect`, `qr`) and emits Slides API requests.
 */
import { runsPlainText } from '../../src/utils/throughChristianEyes/printModel.js';

const INSET = 7.2; // Google Slides' fixed internal text-box horizontal/vertical padding (pt)

const rgb = (hex) => ({
  red: parseInt(hex.slice(1, 3), 16) / 255,
  green: parseInt(hex.slice(3, 5), 16) / 255,
  blue: parseInt(hex.slice(5, 7), 16) / 255,
});

const pt = (v) => ({ magnitude: +v.toFixed(2), unit: 'PT' });

const elementProps = (slide, x, y, w, h) => ({
  pageObjectId: slide,
  size: { width: pt(w), height: pt(h) },
  transform: { scaleX: 1, scaleY: 1, translateX: +x.toFixed(2), translateY: +y.toFixed(2), unit: 'PT' },
});

function textStyleReq(id, st, range) {
  const style = {
    foregroundColor: { opaqueColor: { rgbColor: rgb(st.color) } },
    fontSize: pt(st.size),
    bold: !!st.bold,
    italic: !!st.italic,
  };
  const fields = ['foregroundColor', 'fontSize', 'bold', 'italic'];
  if (st.font) {
    style.weightedFontFamily = { fontFamily: st.font, weight: st.weight || (st.bold ? 700 : 400) };
    fields.push('weightedFontFamily');
  }
  return { updateTextStyle: { objectId: id, textRange: range, style, fields: fields.join(',') } };
}

/**
 * Serializes positioned panel layouts into Slides `batchUpdate` requests + QR placement manifest.
 */
export function emitSlidesDeck({ outSlide, inSlide, insertAt = 38, layouts, colors, runStyleFor, links, siteHost }) {
  const reqs = [
    { createSlide: { objectId: outSlide, insertionIndex: insertAt, slideLayoutReference: { predefinedLayout: 'BLANK' } } },
    { createSlide: { objectId: inSlide, insertionIndex: insertAt + 1, slideLayoutReference: { predefinedLayout: 'BLANK' } } },
  ];
  const qrPlacements = [];
  let seq = 0;

  function emitText(slide, el) {
    const id = `tce_${slide === outSlide ? 'o' : 'i'}_${++seq}`;
    const padded = !!el.bg;
    const x = padded ? el.x : el.x - INSET;
    const y = padded ? el.y : el.y - INSET;
    const w = padded ? el.w : el.w + 2 * INSET;
    const h = el.h + 2 * INSET + 2;

    reqs.push({ createShape: { objectId: id, shapeType: 'TEXT_BOX', elementProperties: elementProps(slide, x, y, w, h) } });

    const paraStrings = el.paras.map(runsPlainText);
    const full = paraStrings.join('\n');
    reqs.push({ insertText: { objectId: id, text: full, insertionIndex: 0 } });
    reqs.push(textStyleReq(id, el.st, { type: 'ALL' }));
    reqs.push({
      updateParagraphStyle: {
        objectId: id,
        textRange: { type: 'ALL' },
        style: {
          lineSpacing: el.st.lineSpacing || 100,
          spaceAbove: pt(0),
          spaceBelow: pt(el.st.spaceBelow || 0),
          alignment: el.st.align || 'START',
        },
        fields: 'lineSpacing,spaceAbove,spaceBelow,alignment',
      },
    });

    let idx = 0;
    el.paras.forEach((runs, pi) => {
      const pStart = idx;
      for (const r of runs) {
        const len = r.t.length;
        if (r.s || r.tlm || r.sal) {
          const rs = runStyleFor(r.s, el.st.size, el.kind, el.dense);
          const st = { ...el.st, ...rs };
          if (rs.font === undefined) st.font = el.st.font;
          if (r.tlm) st.font = 'Amiri';
          if (r.sal) {
            st.font = 'Amiri';
            st.italic = false;
            st.bold = false;
          }
          reqs.push(textStyleReq(id, st, { type: 'FIXED_RANGE', startIndex: idx, endIndex: idx + len }));
        }
        idx += len;
      }
      if (paraStrings[pi].startsWith('•  ')) {
        reqs.push({
          updateParagraphStyle: {
            objectId: id,
            textRange: { type: 'FIXED_RANGE', startIndex: pStart, endIndex: idx },
            style: { indentStart: pt(9.5), indentFirstLine: pt(0) },
            fields: 'indentStart,indentFirstLine',
          },
        });
      }
      idx += 1; // trailing '\n'
    });

    if (el.kind === 'pledge') {
      reqs.push(textStyleReq(id, { ...el.st, size: 6.4, color: colors.red }, { type: 'FIXED_RANGE', startIndex: 0, endIndex: paraStrings[0].length }));
    }

    const props = { contentAlignment: 'TOP', autofit: { autofitType: 'NONE' } };
    let fields = 'contentAlignment,autofit.autofitType';
    if (padded) {
      props.shapeBackgroundFill = { solidFill: { color: { rgbColor: rgb(el.bg) } } };
      fields += ',shapeBackgroundFill.solidFill.color';
    }
    reqs.push({ updateShapeProperties: { objectId: id, shapeProperties: props, fields } });
  }

  function emitList(slide, els) {
    for (const el of els) {
      if (el.t === 'text') {
        emitText(slide, el);
      } else if (el.t === 'line') {
        const id = `tce_l_${++seq}`;
        reqs.push({ createLine: { objectId: id, lineCategory: 'STRAIGHT', elementProperties: elementProps(slide, el.x, el.y, el.w, 0.01) } });
        reqs.push({
          updateLineProperties: {
            objectId: id,
            lineProperties: { lineFill: { solidFill: { color: { rgbColor: rgb(colors.line) } } }, weight: pt(0.75) },
            fields: 'lineFill.solidFill.color,weight',
          },
        });
      } else if (el.t === 'frame') {
        const id = `tce_f_${++seq}`;
        reqs.push({ createShape: { objectId: id, shapeType: 'RECTANGLE', elementProperties: elementProps(slide, el.x, el.y, el.w, el.h) } });
        reqs.push({
          updateShapeProperties: {
            objectId: id,
            shapeProperties: {
              shapeBackgroundFill: { propertyState: 'NOT_RENDERED' },
              outline: { outlineFill: { solidFill: { color: { rgbColor: rgb(el.color) } } }, weight: pt(0.75) },
            },
            fields: 'shapeBackgroundFill.propertyState,outline.outlineFill.solidFill.color,outline.weight',
          },
        });
      } else if (el.t === 'circle') {
        // Separate textless ELLIPSE + overlaid centered TEXT_BOX (grouped) so Slides' 7.2pt shape inset
        // inside a 15pt ellipse never pushes the section digit off-center.
        const bgId = `tce_cb_${++seq}`;
        const txId = `tce_ct_${seq}`;
        const grpId = `tce_cg_${seq}`;
        const cx = el.x + el.d / 2;
        const cy = el.y + el.d / 2 - 0.4;
        const bw = 32;
        const bh = 32;
        reqs.push({ createShape: { objectId: bgId, shapeType: 'ELLIPSE', elementProperties: elementProps(slide, el.x, el.y, el.d, el.d) } });
        reqs.push({
          updateShapeProperties: {
            objectId: bgId,
            shapeProperties: {
              shapeBackgroundFill: { solidFill: { color: { rgbColor: rgb(colors.red) } } },
              outline: { propertyState: 'NOT_RENDERED' },
            },
            fields: 'shapeBackgroundFill.solidFill.color,outline.propertyState',
          },
        });
        reqs.push({ createShape: { objectId: txId, shapeType: 'TEXT_BOX', elementProperties: elementProps(slide, cx - bw / 2, cy - bh / 2, bw, bh) } });
        reqs.push({ insertText: { objectId: txId, text: String(el.num), insertionIndex: 0 } });
        reqs.push(textStyleReq(txId, { font: 'Cinzel', size: el.d * 0.54, color: colors.white, bold: true }, { type: 'ALL' }));
        reqs.push({
          updateParagraphStyle: {
            objectId: txId,
            textRange: { type: 'ALL' },
            style: { alignment: 'CENTER', lineSpacing: 100, spaceAbove: pt(0), spaceBelow: pt(0) },
            fields: 'alignment,lineSpacing,spaceAbove,spaceBelow',
          },
        });
        reqs.push({
          updateShapeProperties: {
            objectId: txId,
            shapeProperties: { contentAlignment: 'MIDDLE', autofit: { autofitType: 'NONE' }, outline: { propertyState: 'NOT_RENDERED' } },
            fields: 'contentAlignment,autofit.autofitType,outline.propertyState',
          },
        });
        reqs.push({ groupObjects: { groupObjectId: grpId, childrenObjectIds: [bgId, txId] } });
      } else if (el.t === 'bar' || el.t === 'rect') {
        const id = `tce_r_${++seq}`;
        const w = el.t === 'bar' ? 2.5 : el.w;
        reqs.push({ createShape: { objectId: id, shapeType: 'RECTANGLE', elementProperties: elementProps(slide, el.x, el.y, w, el.h) } });
        reqs.push({
          updateShapeProperties: {
            objectId: id,
            shapeProperties: {
              shapeBackgroundFill: { solidFill: { color: { rgbColor: rgb(el.color) } } },
              outline: { propertyState: 'NOT_RENDERED' },
            },
            fields: 'shapeBackgroundFill.solidFill.color,outline.propertyState',
          },
        });
      } else if (el.t === 'qr') {
        qrPlacements.push({
          slide,
          id: el.id,
          url: `https://${siteHost}${links[el.id]}`,
          x: +el.x.toFixed(2),
          y: +el.y.toFixed(2),
          size: el.size,
        });
      }
    }
  }

  emitList(outSlide, layouts.back);
  emitList(outSlide, layouts.cover);
  emitList(inSlide, layouts.p2);
  emitList(inSlide, layouts.p3);
  return { reqs, qrPlacements };
}
