/**
 * @class
 */
class GLTFV1 {
    /**
     * 
     * @param {*} rootPath 
     * @param {*} gltf 
     */
    constructor(rootPath, gltf) {
        this.rootPath = rootPath;
        this.gltf = gltf;
    }
    /**
     * 
     * @param {*} cb 
     */
    iterateMesh(cb) {
        const meshes = this.gltf.meshes;
        let index = 0;
        for (const p in meshes) {
            cb(p, meshes[p], index++);
        }
    }
    /**
     * 
     * @param {*} cb 
     */
    iterateNode(cb) {
        const nodes = this.gltf.nodes;
        let index = 0;
        for (const p in nodes) {
            cb(p, nodes[p], index++);
        }
    }
    /**
     * 
     * @param {*} cb 
     */
    iterateScene(cb) {
        const scenes = this.gltf.scenes;
        let index = 0;
        for (const p in scenes) {
            cb(p, scenes[p], index++);
        }
    }
    /**
     * 
     * @param {*} nodeJSON 
     * @param {*} meshes 
     */
    createNode(nodeJSON, meshes) {
        // camera	string	The ID of the camera referenced by this node.	No
        // children	string[]	The IDs of this node's children.	No, default: []
        // skeletons	string[]	The ID of skeleton nodes.	No
        // skin	string	The ID of the skin referenced by this node.	No
        // jointName	string	Name used when this node is a joint in a skin.	No
        // matrix	number[16]	A floating-point 4x4 transformation matrix stored in column-major order.	No, default: [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]
        // meshes	string[]	The IDs of the mesh objects in this node.	No
        // rotation	number[4]	The node's unit quaternion rotation in the order (x, y, z, w), where w is the scalar.	No, default: [0,0,0,1]
        // scale	number[3]	The node's non-uniform scale.	No, default: [1,1,1]
        // translation	number[3]	The node's translation.	No, default: [0,0,0]
        // name	string	The user-defined name of this object.	No
        // extensions	object	Dictionary object with extension-specific objects.	No
        // extras	any	Application-specific data.	No

        const node = {};
        if (defined(nodeJSON.name)) node.name = nodeJSON.name;
        if (defined(nodeJSON.children)) node.children = nodeJSON.children;
        if (defined(nodeJSON.jointName)) node.jointName = nodeJSON.jointName;
        if (defined(nodeJSON.matrix)) node.matrix = nodeJSON.matrix;
        if (defined(nodeJSON.rotation)) node.rotation = nodeJSON.rotation;
        if (defined(nodeJSON.scale)) node.scale = nodeJSON.scale;
        if (defined(nodeJSON.translation)) node.translation = nodeJSON.translation;
        if (defined(nodeJSON.extras)) node.extras = nodeJSON.extras;
        if (defined(nodeJSON.meshes)) {
            node.meshes = nodeJSON.meshes.map(m => meshes[m]);
        }
        //TODO 还缺 camera, skeletons, skin, extensions 的解析
        return node;
    }
    /**
     * 
     * @param {*} index 
     */
    getBaseColorTexture(index) {
        const material = this.gltf.materials[index];
        let tech, texId;
        if (material['instanceTechnique'] && material['instanceTechnique'].values) {
            tech = material['instanceTechnique'];
            texId = tech.values['diffuse'];
        } else {
            tech = material;
            texId = tech.values['tex'] || tech.values['diffuse'];
        }
        if (texId === undefined || this.gltf.textures === undefined) {
            return null;
        }
        const texture = this.gltf.textures[texId];
        if (!texture) {
            return null;
        }
        const sampler = this.gltf.samplers[texture.sampler];
        const info = {
            format : texture.format || 6408,
            internalFormat : texture.internalFormat || 6408,
            type : texture.type || 5121,
            sampler,
            source : this.gltf.images[texture.source]
        };
        return info;
    }
    /**
     * 
     */
    getMaterial() {
        return null;
    }
    /**
     * 
     */
    getAnimations() {
        return null;
    }
}

module.exports = GLTFV1;