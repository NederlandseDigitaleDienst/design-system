import type { ReactiveController, ReactiveControllerHost } from 'lit';

/**
 * The safe triangle of a cascade submenu (Mayank/ishadeed pattern). While a
 * submenu is open beside its opener, a global mousemove listener tracks the
 * cursor against a wedge from the point where it left the opener to the two
 * near corners of the submenu. While the cursor is inside the wedge, peer items
 * don't activate, so a diagonal route to the submenu does not close it.
 *
 * The apex is pinned once the cursor crosses the top or bottom edge of the
 * opener and stays fixed until the cursor enters the submenu, so the user has
 * a predictable, stable area to traverse. Leaving the opener sideways gives no
 * protection. There is no auto-close on hover-out: moving the cursor to empty
 * space leaves the chain open, and click-outside (popover light-dismiss) is the
 * only gesture that collapses it.
 */

export interface Point {
	x: number;
	y: number;
}

/** When the cursor sits motionless inside the triangle for this long, the
 *  protection drops and whatever item is under the cursor becomes interactive.
 *  Without this, a paused cursor would stay protected indefinitely. */
export const STALL_DISMISS_MS = 500;

/**
 * How far the apex is pulled away from the submenu edge (to the left for a
 * submenu on the right). Widens the wedge near the cursor so brief diagonal
 * wobble doesn't pop the cursor out at the apex, and avoids the degenerate
 * single-line wedge when the cursor crossed the opener edge at the same x as
 * the near submenu corner. Always negative: the standard placement is
 * submenu-right, so "left" is the intuitive forgive direction.
 */
export const APEX_X_OFFSET = 4;

/** True when the rect contains the point (inclusive). False for a missing rect
 *  or point. */
export function rectContainsPoint(rect: DOMRect | null | undefined, point: Point | null | undefined): boolean {
	return !!rect && !!point
		&& point.x >= rect.left && point.x <= rect.right
		&& point.y >= rect.top && point.y <= rect.bottom;
}

/** Convex point-in-polygon test via consistent edge-cross-product sign.
 *  Vertices must be ordered (clockwise or counter-clockwise). */
export function pointInPolygon(p: Point, vertices: Point[]): boolean {
	let hasNeg = false;
	let hasPos = false;
	for (let i = 0; i < vertices.length; i++) {
		const a = vertices[i];
		const b = vertices[(i + 1) % vertices.length];
		const cross = (p.x - b.x) * (a.y - b.y) - (a.x - b.x) * (p.y - b.y);
		if (cross < 0) hasNeg = true;
		if (cross > 0) hasPos = true;
		if (hasNeg && hasPos) return false;
	}
	return true;
}

/** The wedge from `apex` to the submenu edge facing the cursor: the left edge
 *  for a submenu on the right, the right edge when Floating UI flipped it. */
export function wedge(apex: Point, cursor: Point, submenu: DOMRect): Point[] {
	const nearX = cursor.x < submenu.left ? submenu.left : submenu.right;
	return [apex, { x: nearX, y: submenu.top }, { x: nearX, y: submenu.bottom }];
}

/** The apex where the cursor crossed the top or bottom edge of the opener: x
 *  clamped to the opener so the wedge starts at its visual edge however far
 *  past it this sample is, then pulled away by APEX_X_OFFSET. */
export function apexAt(cursor: Point, opener: DOMRect): Point {
	return {
		x: Math.max(opener.left, Math.min(opener.right, cursor.x)) - APEX_X_OFFSET,
		y: cursor.y > opener.bottom ? opener.bottom : opener.top,
	};
}

/** What the triangle needs from the menu it protects. */
export interface SafeTriangleHost extends ReactiveControllerHost {
	/** The item whose submenu is open, or null. */
	readonly safeTriangleOpener: HTMLElement | null;
	/** Whether a point is in the submenu or any submenu below it. */
	isPointInSubmenus(point: Point, submenu: HTMLElement): boolean;
	/** Highlight the opener, clearing any peer. */
	highlightOpener(): void;
	/** Activate the item under a point, as a mouseenter would have. */
	activateItemAt(point: Point): void;
	/** Draw the wedge on screen, for tuning. */
	readonly debugSafeTriangle: boolean;
}

export class SafeTriangleController implements ReactiveController {
	/** True while the cursor is on its way to the submenu: peers stay inactive. */
	movingToward = false;

	private _listener: ((e: MouseEvent) => void) | null = null;
	private _stallTimer: number | null = null;
	private _lastPos: Point | null = null;
	private _apex: Point | null = null;
	private _overlay: HTMLDivElement | null = null;

	constructor(private readonly _host: SafeTriangleHost) {
		_host.addController(this);
	}

	hostDisconnected(): void {
		this.stop();
	}

	/** Start tracking for a submenu that just opened in cascade mode. */
	start(submenu: HTMLElement): void {
		this.stop();
		this._listener = (e: MouseEvent) => this._track({ x: e.clientX, y: e.clientY }, submenu);
		window.addEventListener('mousemove', this._listener);
	}

	stop(): void {
		if (this._listener !== null) {
			window.removeEventListener('mousemove', this._listener);
			this._listener = null;
		}
		this._clearStall();
		this._lastPos = null;
		this._apex = null;
		this.movingToward = false;
		this._removeOverlay();
	}

	private _track(p: Point, submenu: HTMLElement): void {
		// Arrived in the submenu, or one below it. The listener stays: a return
		// to the opener has to pin a fresh apex for the next exit.
		if (this._host.isPointInSubmenus(p, submenu)) {
			this.movingToward = false;
			this._lastPos = p;
			this._apex = null;
			this._host.safeTriangleOpener?.removeAttribute('highlighted');
			this._removeOverlay();
			return;
		}

		const r = submenu.getBoundingClientRect();
		const openerRect = this._host.safeTriangleOpener?.getBoundingClientRect();
		const onOpener = rectContainsPoint(openerRect, p);
		const lastOnOpener = rectContainsPoint(openerRect, this._lastPos);
		// Back on the opener: drop the apex so the next exit pins a fresh one.
		if (this._apex !== null && onOpener) this._apex = null;
		const wasMoving = this.movingToward;

		if (this._apex === null) {
			if (onOpener) {
				// Still on the opener, waiting for an exit direction. The opener is
				// highlighted up front, so the accent is on before the cursor first
				// crosses an edge rather than popping in then.
				this.movingToward = true;
				this._lastPos = p;
				const opener = this._host.safeTriangleOpener;
				if (opener && !opener.hasAttribute('highlighted')) this._host.highlightOpener();
				if (this._host.debugSafeTriangle && openerRect) {
					this._drawOverlay(wedge({ x: p.x - APEX_X_OFFSET, y: p.y }, p, r));
				}
				return;
			}
			if (openerRect && lastOnOpener && (p.y > openerRect.bottom || p.y < openerRect.top)) {
				this._apex = apexAt(p, openerRect);
				this.movingToward = true;
			} else {
				// Left sideways: no protection, and the item under the cursor takes
				// over at once (its own mouseenter fired while still protected).
				this.movingToward = false;
				this._lastPos = p;
				this._removeOverlay();
				if (wasMoving) this._host.activateItemAt(p);
			}
		} else {
			const shape = wedge(this._apex, p, r);
			this.movingToward = pointInPolygon(p, shape);
			if (this._host.debugSafeTriangle) this._drawOverlay(shape);
		}
		this._lastPos = p;

		// Keep the opener highlighted while in transit, clearing any peer that
		// lit up on a wobble along the edge of the wedge.
		const opener = this._host.safeTriangleOpener;
		if (opener && this.movingToward && !opener.hasAttribute('highlighted')) this._host.highlightOpener();
		// Turned away: the cursor may sit on a peer whose mouseenter fired while
		// still protected, and that will not fire again until it leaves.
		if (wasMoving && !this.movingToward) this._host.activateItemAt(p);
		this._scheduleStall();
	}

	private _clearStall(): void {
		if (this._stallTimer === null) return;
		clearTimeout(this._stallTimer);
		this._stallTimer = null;
	}

	private _scheduleStall(): void {
		this._clearStall();
		if (!this.movingToward) return;
		this._stallTimer = window.setTimeout(() => {
			this._stallTimer = null;
			this.movingToward = false;
			this._apex = null;
			if (this._lastPos) this._host.activateItemAt(this._lastPos);
		}, STALL_DISMISS_MS);
	}

	private _drawOverlay(vertices: Point[]): void {
		const NS = 'http://www.w3.org/2000/svg';
		if (this._overlay === null) {
			const wrapper = document.createElement('div');
			wrapper.setAttribute('popover', 'manual');
			wrapper.setAttribute('aria-hidden', 'true');
			wrapper.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;border:0;padding:0;margin:0;background:transparent;overflow:visible;';
			const svg = document.createElementNS(NS, 'svg');
			svg.setAttribute('width', '100%');
			svg.setAttribute('height', '100%');
			const polygon = document.createElementNS(NS, 'polygon');
			polygon.setAttribute('fill', 'rgba(255, 0, 128, 0.15)');
			polygon.setAttribute('stroke', 'rgba(255, 0, 128, 0.85)');
			polygon.setAttribute('stroke-width', '1');
			svg.appendChild(polygon);
			wrapper.appendChild(svg);
			document.body.appendChild(wrapper);
			wrapper.showPopover();
			this._overlay = wrapper;
		}
		this._overlay.querySelector('polygon')!.setAttribute('points', vertices.map(v => `${v.x},${v.y}`).join(' '));
	}

	private _removeOverlay(): void {
		this._overlay?.hidePopover?.();
		this._overlay?.remove();
		this._overlay = null;
	}
}
