import { MetaKey as MetaKeyType } from 'Types';

export default function MetaKey({ metaKey }: { metaKey: MetaKeyType }) {

    return (
        <div className="meta-key">
            <div className='meta-key-value'>{metaKey.label}</div>
            <div className='meta-key-descritpion'>{metaKey.description}</div>
            <div className='meta-key-exemple'>Exemple: {metaKey.exemple}</div>
        </div>
    )
}