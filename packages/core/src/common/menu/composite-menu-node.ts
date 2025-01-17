// *****************************************************************************
// Copyright (C) 2022 Ericsson and others.
//
// This program and the accompanying materials are made available under the
// terms of the Eclipse Public License v. 2.0 which is available at
// http://www.eclipse.org/legal/epl-2.0.
//
// This Source Code may also be made available under the following Secondary
// Licenses when the conditions for such availability set forth in the Eclipse
// Public License v. 2.0 are satisfied: GNU General Public License, version 2
// with the GNU Classpath Exception which is available at
// https://www.gnu.org/software/classpath/license.html.
//
// SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
// *****************************************************************************

import { Disposable } from '../disposable';
import { CompoundMenuNode, CompoundMenuNodeMetadata, CompoundMenuNodeRole, MenuNode, SubMenuOptions } from './menu-types';

/**
 * Node representing a (sub)menu in the menu tree structure.
 */
export class CompositeMenuNode implements MenuNode, CompoundMenuNode, CompoundMenuNodeMetadata {
    protected readonly _children: MenuNode[] = [];
    public iconClass?: string;
    public order?: string;
    readonly when?: string;
    readonly _role?: CompoundMenuNodeRole;

    constructor(
        public readonly id: string,
        public label?: string,
        options?: SubMenuOptions,
        readonly parent?: MenuNode & CompoundMenuNode,
    ) {
        if (options) {
            this.iconClass = options.iconClass;
            this.order = options.order;
            this.when = options.when;
            this._role = options?.role;
        }
    }

    get icon(): string | undefined {
        return this.iconClass;
    }

    get children(): ReadonlyArray<MenuNode> {
        return this._children;
    }

    get role(): CompoundMenuNodeRole { return this._role ?? (this.label ? CompoundMenuNodeRole.Submenu : CompoundMenuNodeRole.Group); }

    /**
     * Inserts the given node at the position indicated by `sortString`.
     *
     * @returns a disposable which, when called, will remove the given node again.
     */
    public addNode(node: MenuNode): Disposable {
        this._children.push(node);
        this._children.sort(CompoundMenuNode.sortChildren);
        return {
            dispose: () => {
                const idx = this._children.indexOf(node);
                if (idx >= 0) {
                    this._children.splice(idx, 1);
                }
            }
        };
    }

    /**
     * Removes the first node with the given id.
     *
     * @param id node id.
     */
    public removeNode(id: string): void {
        const idx = this._children.findIndex(n => n.id === id);
        if (idx >= 0) {
            this._children.splice(idx, 1);
        }
    }

    get sortString(): string {
        return this.order || this.id;
    }

    get isSubmenu(): boolean {
        return Boolean(this.label);
    }

    /** @deprecated @since 1.28 use CompoundMenuNode.isNavigationGroup instead */
    static isNavigationGroup = CompoundMenuNode.isNavigationGroup;
}

export class CompositeMenuNodeWrapper implements MenuNode, CompoundMenuNodeMetadata {
    constructor(protected readonly wrapped: Readonly<CompositeMenuNode>, readonly parent: MenuNode & CompoundMenuNode, protected readonly options?: SubMenuOptions) { }

    get id(): string { return this.wrapped.id; }

    get label(): string | undefined { return this.wrapped.label; }

    get sortString(): string { return this.order || this.id; }

    get isSubmenu(): boolean { return Boolean(this.label); }

    get role(): CompoundMenuNodeRole { return this.options?.role ?? this.wrapped.role; }

    get icon(): string | undefined { return this.iconClass; }

    get iconClass(): string | undefined { return this.options?.iconClass ?? this.wrapped.iconClass; }

    get order(): string | undefined { return this.options?.order ?? this.wrapped.order; }

    get when(): string | undefined { return this.options?.when ?? this.wrapped.when; }

    get children(): ReadonlyArray<MenuNode> { return this.wrapped.children; }
}
