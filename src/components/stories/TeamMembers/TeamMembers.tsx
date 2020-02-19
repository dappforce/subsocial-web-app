import React from 'react';
import { Icon, Avatar} from 'antd';

import faker from 'faker';
import './teamMembers.css';

const TeamMembers = () => {

    let testMembersData: {
        id: number,
        name: string,
        avatarSrc: string,
        position: string,
        company: string,
        lastUpdate: string
    }[] = [
        { "id": 0, "name": "Available", "avatarSrc": faker.image.avatar(), "position": "Polkadot Ambassador", "company": "Web3 Foundation", "lastUpdate": "July 28, 2017 10:53 AM" },
        { "id": 1, "name": "Available", "avatarSrc": faker.image.avatar(), "position": "Software Developer", "company": "IBM", "lastUpdate": "July 17, 2017 2:53 AM" },
    ];

    return (
        <div className={'teamMembers'} >
            <div className={'tm_header'}>
                <h2>Team Members</h2>

                <Icon className="tm_plus_icon" type="plus-circle" />

            </div>
            {testMembersData.map((d) => {
                return ( <div className="tm_item" id={`${d.id}`}>
                    <Avatar
                        className={'tm_item_avatar'}
                        src={d.avatarSrc}/>
                    <div className={'tm_item_right_content'}>
                        <div className={'tm_item_f_col'}>
                            <div className={'tm_item_position'}>{d.position}</div>
                            <div className={'tm_item_company'}>{d.company}</div>
                            <div className={'tm_item_lastupdate'}>{d.lastUpdate}</div>
                        </div>
                        <div className={'tm_item_s_col'}>
                            <Icon type="edit" className={'tm_edit_icon'}/>
                        </div>
                    </div>
                </div>);
            })}
        </div>
    );
};




export default TeamMembers;